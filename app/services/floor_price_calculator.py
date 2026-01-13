import statistics
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class FloorPriceCalculator:
    """
    Calcule le prix plancher d'une carte basé sur les ventes récentes.
    Utilise la médiane, suppression des outliers, et pondération temporelle.
    """
    
    def __init__(self):
        self.min_sales = settings.min_sales_for_floor
        self.max_sales = settings.max_sales_for_floor
    
    def calculate_floor_price(
        self,
        sales: List[Dict],
        psa_grade: Optional[str] = None,
        language: Optional[str] = None
    ) -> Optional[float]:
        """
        Calcule le prix plancher à partir d'une liste de ventes.
        
        Args:
            sales: Liste de dictionnaires avec 'price', 'sold_date', 'psa_grade', 'language'
            psa_grade: Grade PSA à filtrer (optionnel)
            language: Langue à filtrer (optionnel)
        
        Returns:
            Prix plancher calculé ou None si pas assez de données
        """
        if not sales:
            return None
        
        # Filtrer par grade et langue si spécifiés
        filtered_sales = self._filter_sales(sales, psa_grade, language)
        
        if len(filtered_sales) < self.min_sales:
            logger.warning(f"Pas assez de ventes pour calculer le prix plancher: {len(filtered_sales)} < {self.min_sales}")
            return None
        
        # Limiter au nombre maximum de ventes (les plus récentes)
        filtered_sales = sorted(
            filtered_sales,
            key=lambda x: x.get('sold_date', datetime.min),
            reverse=True
        )[:self.max_sales]
        
        # Extraire les prix
        prices = [sale['price'] for sale in filtered_sales]
        
        # Supprimer les outliers
        prices_clean = self._remove_outliers(prices)
        
        if len(prices_clean) < self.min_sales:
            logger.warning(f"Pas assez de ventes après suppression des outliers: {len(prices_clean)}")
            return None
        
        # Calculer la médiane pondérée par la date
        floor_price = self._weighted_median(prices_clean, filtered_sales)
        
        return floor_price
    
    def _filter_sales(
        self,
        sales: List[Dict],
        psa_grade: Optional[str],
        language: Optional[str]
    ) -> List[Dict]:
        """Filtre les ventes par grade PSA et langue"""
        filtered = sales
        
        if psa_grade:
            filtered = [
                s for s in filtered
                if s.get('psa_grade') == psa_grade
            ]
        
        if language:
            filtered = [
                s for s in filtered
                if s.get('language', 'EN').upper() == language.upper()
            ]
        
        return filtered
    
    def _remove_outliers(self, prices: List[float]) -> List[float]:
        """
        Supprime les outliers en utilisant la méthode IQR (Interquartile Range).
        """
        if len(prices) < 4:
            return prices
        
        sorted_prices = sorted(prices)
        q1 = statistics.median(sorted_prices[:len(sorted_prices)//2])
        q3 = statistics.median(sorted_prices[len(sorted_prices)//2:])
        iqr = q3 - q1
        
        # Seuil: 1.5 * IQR
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        filtered = [p for p in prices if lower_bound <= p <= upper_bound]
        
        # Si on a supprimé trop de valeurs, retourner les prix originaux
        if len(filtered) < len(prices) * 0.5:
            logger.warning("Trop d'outliers détectés, utilisation de tous les prix")
            return prices
        
        return filtered
    
    def _weighted_median(
        self,
        prices: List[float],
        sales: List[Dict]
    ) -> float:
        """
        Calcule la médiane pondérée par la date (les ventes récentes ont plus de poids).
        """
        if len(prices) != len(sales):
            # Fallback sur médiane simple
            return statistics.median(prices)
        
        # Calculer les poids basés sur la date (plus récent = plus de poids)
        now = datetime.utcnow()
        weights = []
        
        for sale in sales:
            sold_date = sale.get('sold_date', now)
            if isinstance(sold_date, str):
                sold_date = datetime.fromisoformat(sold_date.replace('Z', '+00:00'))
            
            days_ago = (now - sold_date.replace(tzinfo=None)).days
            # Poids décroissant exponentiellement avec le temps
            # Vente d'aujourd'hui = poids 1.0, vente de 30 jours = poids ~0.3
            weight = max(0.1, 1.0 / (1.0 + days_ago / 10.0))
            weights.append(weight)
        
        # Normaliser les poids
        total_weight = sum(weights)
        if total_weight == 0:
            return statistics.median(prices)
        
        normalized_weights = [w / total_weight for w in weights]
        
        # Créer une liste de (prix, poids) et trier par prix
        weighted_prices = list(zip(prices, normalized_weights))
        weighted_prices.sort(key=lambda x: x[0])
        
        # Calculer la médiane pondérée
        cumulative_weight = 0
        median_weight = 0.5
        
        for price, weight in weighted_prices:
            cumulative_weight += weight
            if cumulative_weight >= median_weight:
                return price
        
        # Fallback
        return statistics.median(prices)
    
    def get_statistics(self, sales: List[Dict]) -> Dict:
        """
        Retourne des statistiques sur les ventes pour analyse.
        """
        if not sales:
            return {}
        
        prices = [s['price'] for s in sales]
        
        return {
            "count": len(prices),
            "min": min(prices),
            "max": max(prices),
            "mean": statistics.mean(prices),
            "median": statistics.median(prices),
            "stdev": statistics.stdev(prices) if len(prices) > 1 else 0,
        }

