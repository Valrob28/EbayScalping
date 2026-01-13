import httpx
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.core.config import settings
import logging
import re

logger = logging.getLogger(__name__)

# Optionnel : Importer le scraper comme fallback
try:
    from app.services.ebay_scraper import eBayScraper
    SCRAPING_AVAILABLE = True
except ImportError:
    SCRAPING_AVAILABLE = False
    logger.info("Scraping non disponible (beautifulsoup4 non installé)")


class eBayService:
    """
    Service pour interagir avec les APIs eBay.
    Utilise l'API Browse pour les listings et l'API Finding pour les ventes complétées.
    """
    
    def __init__(self):
        self.app_id = settings.ebay_app_id
        self.client_id = settings.ebay_client_id
        self.client_secret = settings.ebay_client_secret
        self.base_url_browse = "https://api.ebay.com/buy/browse/v1"
        self.base_url_finding = "https://svcs.ebay.com/services/search/FindingService/v1"
        self.access_token: Optional[str] = None
        
        # Scraper comme fallback ou mode principal
        self.use_scraper_fallback = getattr(settings, 'use_scraper_fallback', True)
        self.use_scraping_mode = getattr(settings, 'use_scraping_mode', True)
        
        # Initialiser le scraper si disponible et nécessaire
        if SCRAPING_AVAILABLE and (self.use_scraper_fallback or self.use_scraping_mode):
            self.scraper = eBayScraper()
        else:
            self.scraper = None
    
    async def _get_access_token(self) -> str:
        """
        Obtient un token d'accès OAuth pour l'API eBay.
        Note: Pour un MVP, on peut utiliser un token d'application (App Token) pour certaines APIs.
        """
        if self.access_token:
            return self.access_token
        
        # Pour l'API Finding (ventes complétées), on peut utiliser l'App ID directement
        # Pour l'API Browse, il faut OAuth 2.0
        # Pour le MVP, on va utiliser l'App ID pour Finding API
        # et simuler pour Browse API (ou utiliser un token statique si disponible)
        
        # TODO: Implémenter OAuth flow complet si nécessaire
        # Pour l'instant, on retourne None et on utilise App ID pour Finding API
        return ""
    
    async def search_completed_sales(
        self,
        query: str,
        days_back: int = 30,
        psa_grade: Optional[str] = None,
        language: str = "EN",
        limit: int = 100
    ) -> List[Dict]:
        """
        Recherche les ventes complétées sur eBay.
        
        Utilise le scraping si les clés API ne sont pas configurées.
        
        Args:
            query: Terme de recherche (ex: "Pokemon Charizard PSA")
            days_back: Nombre de jours en arrière pour les ventes
            psa_grade: Grade PSA spécifique (ex: "PSA 10")
            language: Langue de la carte (EN, JP)
            limit: Nombre maximum de résultats
        
        Returns:
            Liste de dictionnaires contenant les données des ventes
        """
        # Si pas de clés API ou mode scraping activé, utiliser le scraper
        if (not self.app_id or self.app_id == "your_ebay_app_id" or 
            settings.use_scraping_mode or self.scraper):
            logger.info("Utilisation du scraping (pas de clés API ou mode scraping activé)")
            if self.scraper:
                return await self.scraper.scrape_completed_listings(
                    search_query=f"{query} {psa_grade}" if psa_grade else query,
                    max_results=limit,
                    days_back=days_back
                )
            elif SCRAPING_AVAILABLE:
                scraper = eBayScraper()
                return await scraper.scrape_completed_listings(
                    search_query=f"{query} {psa_grade}" if psa_grade else query,
                    max_results=limit,
                    days_back=days_back
                )
            else:
                logger.warning("Scraping non disponible, retour liste vide")
                return []
        
        try:
            # API Finding pour les ventes complétées
            params = {
                "OPERATION-NAME": "findCompletedItems",
                "SERVICE-VERSION": "1.0.0",
                "SECURITY-APPNAME": self.app_id,
                "RESPONSE-DATA-FORMAT": "JSON",
                "REST-PAYLOAD": "",
                "keywords": query,
                "itemFilter(0).name": "SoldItemsOnly",
                "itemFilter(0).value": "true",
                "itemFilter(1).name": "ListingType",
                "itemFilter(1).value": "FixedPrice",
                "paginationInput.entriesPerPage": min(limit, 100),
            }
            
            # Filtrer par date (30 derniers jours)
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days_back)
            params["itemFilter(2).name"] = "EndTimeFrom"
            params["itemFilter(2).value"] = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            params["itemFilter(3).name"] = "EndTimeTo"
            params["itemFilter(3).value"] = end_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            
            # Ajouter filtre PSA si spécifié
            if psa_grade:
                params["keywords"] = f"{query} {psa_grade}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.base_url_finding, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Parser la réponse de l'API Finding
                items = []
                if "findCompletedItemsResponse" in data:
                    search_result = data["findCompletedItemsResponse"][0].get("searchResult", [{}])[0]
                    if "item" in search_result:
                        for item in search_result["item"]:
                            items.append(self._parse_completed_item(item))
                
                logger.info(f"Récupéré {len(items)} ventes complétées pour '{query}'")
                return items
                
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de ventes complétées: {e}")
            
            # Fallback sur scraping si disponible et activé
            if self.scraper and self.use_scraper_fallback:
                logger.warning("Utilisation du scraper comme fallback (non recommandé)")
                try:
                    return await self.scraper.scrape_completed_listings(
                        query=query,
                        days_back=days_back,
                        max_results=limit
                    )
                except Exception as scrape_error:
                    logger.error(f"Erreur lors du scraping: {scrape_error}")
            
            return []
    
    def _parse_completed_item(self, item: Dict) -> Dict:
        """Parse un item de l'API Finding en format standardisé"""
        # L'API Finding retourne souvent des listes même pour un seul élément
        def safe_get(data, key, default=None, index=0):
            value = data.get(key, default)
            if isinstance(value, list) and len(value) > index:
                return value[index]
            return value if value != default else default
        
        selling_status = safe_get(item, "sellingStatus", {})
        listing_info = safe_get(item, "listingInfo", {})
        
        # Extraire le prix
        current_price = safe_get(selling_status, "currentPrice", {})
        price_value = safe_get(current_price, "__value__", "0")
        
        # Extraire les frais de shipping
        shipping_info = safe_get(item, "shippingInfo", {})
        shipping_cost = 0.0
        if shipping_info:
            shipping_service_cost = safe_get(shipping_info, "shippingServiceCost", {})
            if shipping_service_cost:
                shipping_cost = float(safe_get(shipping_service_cost, "__value__", "0"))
        
        # Extraire la date de fin
        end_time_str = safe_get(listing_info, "endTime", "")
        
        # Extraire la condition
        condition_obj = safe_get(item, "condition", {})
        condition = None
        if condition_obj:
            condition = safe_get(condition_obj, "conditionDisplayName", "")
        
        return {
            "ebay_item_id": safe_get(item, "itemId", ""),
            "title": safe_get(item, "title", ""),
            "price": float(price_value),
            "shipping_cost": shipping_cost,
            "sold_date": datetime.fromisoformat(end_time_str.replace("Z", "+00:00")) if end_time_str else datetime.utcnow(),
            "url": safe_get(item, "viewItemURL", ""),
            "condition": condition,
        }
    
    async def search_active_listings(
        self,
        query: str,
        psa_grade: Optional[str] = None,
        language: str = "EN",
        limit: int = 100
    ) -> List[Dict]:
        """
        Recherche les listings actifs sur eBay.
        
        Args:
            query: Terme de recherche
            psa_grade: Grade PSA spécifique
            language: Langue de la carte
            limit: Nombre maximum de résultats
        
        Returns:
            Liste de dictionnaires contenant les données des listings
        """
        try:
            # Pour l'API Browse, on aurait besoin d'OAuth
            # Pour le MVP, on peut utiliser l'API Finding avec "AvailableTo" filter
            params = {
                "OPERATION-NAME": "findItemsAdvanced",
                "SERVICE-VERSION": "1.0.0",
                "SECURITY-APPNAME": self.app_id,
                "RESPONSE-DATA-FORMAT": "JSON",
                "REST-PAYLOAD": "",
                "keywords": query,
                "itemFilter(0).name": "ListingType",
                "itemFilter(0).value": "FixedPrice",
                "paginationInput.entriesPerPage": min(limit, 100),
            }
            
            if psa_grade:
                params["keywords"] = f"{query} {psa_grade}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.base_url_finding, params=params)
                response.raise_for_status()
                data = response.json()
                
                items = []
                if "findItemsAdvancedResponse" in data:
                    response_data = data["findItemsAdvancedResponse"][0]
                    if "searchResult" in response_data and len(response_data["searchResult"]) > 0:
                        search_result = response_data["searchResult"][0]
                        if "item" in search_result:
                            # L'API peut retourner un seul item ou une liste
                            item_list = search_result["item"]
                            if not isinstance(item_list, list):
                                item_list = [item_list]
                            for item in item_list:
                                items.append(self._parse_active_item(item))
                
                logger.info(f"Récupéré {len(items)} listings actifs pour '{query}'")
                return items
                
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de listings actifs: {e}")
            
            # Fallback sur scraping si disponible
            if self.scraper and self.use_scraper_fallback:
                logger.warning("Utilisation du scraper comme fallback")
                try:
                    return await self._scrape_active_listings(query, limit)
                except Exception as scrape_error:
                    logger.error(f"Erreur lors du scraping: {scrape_error}")
            
            return []
    
    async def _scrape_active_listings(self, query: str, limit: int) -> List[Dict]:
        """Scrape les listings actifs depuis la page de recherche eBay"""
        if not SCRAPING_AVAILABLE:
            return []
        
        scraper = self.scraper or eBayScraper()
        
        # Scraper la page de recherche normale (pas les ventes complétées)
        try:
            scraper._rate_limit()
            
            params = {
                "_nkw": query,
                "_sop": "15",  # Trier par prix croissant
                "LH_BIN": "1",  # Buy It Now seulement
                "_ipg": "200",
            }
            
            async with httpx.AsyncClient(
                headers=scraper.headers,
                timeout=30.0,
                follow_redirects=True
            ) as client:
                response = await client.get(
                    f"{scraper.base_url}/sch/i.html",
                    params=params
                )
                response.raise_for_status()
                
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, "html.parser")
                
                listings = []
                items = soup.find_all("li", class_=re.compile(r"s-item"))
                
                if not items:
                    items = soup.find_all("div", class_=re.compile(r"s-item"))
                
                for item in items[:limit]:
                    listing_data = scraper._parse_listing_item(item)
                    if listing_data:
                        # Pour les listings actifs, pas de sold_date
                        listing_data.pop("sold_date", None)
                        listings.append(listing_data)
                
                return listings
        except Exception as e:
            logger.error(f"Erreur lors du scraping des listings actifs: {e}")
            return []
    
    def _parse_active_item(self, item: Dict) -> Dict:
        """Parse un item actif de l'API Finding en format standardisé"""
        # L'API Finding retourne souvent des listes même pour un seul élément
        def safe_get(data, key, default=None, index=0):
            value = data.get(key, default)
            if isinstance(value, list) and len(value) > index:
                return value[index]
            return value if value != default else default
        
        selling_status = safe_get(item, "sellingStatus", {})
        
        # Extraire le prix
        current_price = safe_get(selling_status, "currentPrice", {})
        price_value = safe_get(current_price, "__value__", "0")
        
        # Extraire les frais de shipping
        shipping_info = safe_get(item, "shippingInfo", {})
        shipping_cost = 0.0
        if shipping_info:
            shipping_service_cost = safe_get(shipping_info, "shippingServiceCost", {})
            if shipping_service_cost:
                shipping_cost = float(safe_get(shipping_service_cost, "__value__", "0"))
        
        # Extraire la condition
        condition_obj = safe_get(item, "condition", {})
        condition = None
        if condition_obj:
            condition = safe_get(condition_obj, "conditionDisplayName", "")
        
        return {
            "ebay_item_id": safe_get(item, "itemId", ""),
            "title": safe_get(item, "title", ""),
            "price": float(price_value),
            "shipping_cost": shipping_cost,
            "url": safe_get(item, "viewItemURL", ""),
            "condition": condition,
        }
    
    def extract_psa_grade(self, title: str) -> Optional[str]:
        """
        Extrait le grade PSA du titre d'un listing.
        Ex: "Charizard PSA 10" -> "PSA 10"
        """
        import re
        pattern = r"PSA\s*(\d+)"
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            return f"PSA {match.group(1)}"
        return None
    
    def extract_language(self, title: str) -> str:
        """
        Détecte la langue de la carte depuis le titre.
        """
        title_lower = title.lower()
        if any(keyword in title_lower for keyword in ["japanese", "jp", "jpn", "日本語"]):
            return "JP"
        return "EN"

