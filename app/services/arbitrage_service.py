from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models import Card, Sale, Listing, Opportunity
from app.services.ebay_service import eBayService
from app.services.card_normalizer import CardNormalizer
from app.services.floor_price_calculator import FloorPriceCalculator
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ArbitrageService:
    """
    Service principal pour la détection d'opportunités d'arbitrage.
    """
    
    def __init__(self):
        self.ebay_service = eBayService()
        self.card_normalizer = CardNormalizer()
        self.floor_calculator = FloorPriceCalculator()
        self.arbitrage_threshold = settings.arbitrage_threshold
        self.ebay_fee_rate = settings.ebay_fee_rate
        self.shipping_cost = settings.shipping_cost
    
    async def fetch_and_store_sales(
        self,
        db: Session,
        search_query: str,
        psa_grade: Optional[str] = None,
        language: str = "EN",
        days_back: int = 30
    ) -> int:
        """
        Récupère les ventes complétées depuis eBay et les stocke en DB.
        
        Returns:
            Nombre de ventes ajoutées
        """
        logger.info(f"Récupération des ventes pour: {search_query}")
        
        # Récupérer les ventes depuis eBay
        ebay_sales = await self.ebay_service.search_completed_sales(
            query=search_query,
            days_back=days_back,
            psa_grade=psa_grade,
            language=language
        )
        
        added_count = 0
        
        for ebay_sale in ebay_sales:
            # Normaliser le nom de la carte
            normalized_name = self.card_normalizer.normalize_card_name(ebay_sale['title'])
            
            # Extraire les métadonnées
            psa_grade_extracted = self.ebay_service.extract_psa_grade(ebay_sale['title'])
            language_extracted = self.ebay_service.extract_language(ebay_sale['title'])
            card_set = self.card_normalizer.extract_card_set(ebay_sale['title'])
            card_number = self.card_normalizer.extract_card_number(ebay_sale['title'])
            
            # Trouver ou créer la carte
            card = db.query(Card).filter(
                Card.normalized_name == normalized_name,
                Card.language == language_extracted
            ).first()
            
            if not card:
                card = Card(
                    normalized_name=normalized_name,
                    raw_name=ebay_sale['title'],
                    card_set=card_set,
                    card_number=card_number,
                    language=language_extracted
                )
                db.add(card)
                db.flush()
            
            # Vérifier si la vente existe déjà
            existing_sale = db.query(Sale).filter(
                Sale.ebay_item_id == ebay_sale['ebay_item_id']
            ).first()
            
            if not existing_sale:
                sale = Sale(
                    card_id=card.id,
                    ebay_item_id=ebay_sale['ebay_item_id'],
                    title=ebay_sale['title'],
                    price=ebay_sale['price'],
                    shipping_cost=ebay_sale.get('shipping_cost', 0.0),
                    sold_date=ebay_sale['sold_date'],
                    psa_grade=psa_grade_extracted or psa_grade,
                    condition=ebay_sale.get('condition')
                )
                db.add(sale)
                added_count += 1
        
        db.commit()
        logger.info(f"Ajouté {added_count} nouvelles ventes")
        
        return added_count
    
    async def fetch_and_store_listings(
        self,
        db: Session,
        search_query: str,
        psa_grade: Optional[str] = None,
        language: str = "EN"
    ) -> int:
        """
        Récupère les listings actifs depuis eBay et les stocke en DB.
        
        Returns:
            Nombre de listings ajoutés/mis à jour
        """
        logger.info(f"Récupération des listings actifs pour: {search_query}")
        
        ebay_listings = await self.ebay_service.search_active_listings(
            query=search_query,
            psa_grade=psa_grade,
            language=language
        )
        
        updated_count = 0
        
        for ebay_listing in ebay_listings:
            # Normaliser le nom de la carte
            normalized_name = self.card_normalizer.normalize_card_name(ebay_listing['title'])
            
            # Extraire les métadonnées
            psa_grade_extracted = self.ebay_service.extract_psa_grade(ebay_listing['title'])
            language_extracted = self.ebay_service.extract_language(ebay_listing['title'])
            card_set = self.card_normalizer.extract_card_set(ebay_listing['title'])
            card_number = self.card_normalizer.extract_card_number(ebay_listing['title'])
            
            # Trouver ou créer la carte
            card = db.query(Card).filter(
                Card.normalized_name == normalized_name,
                Card.language == language_extracted
            ).first()
            
            if not card:
                card = Card(
                    normalized_name=normalized_name,
                    raw_name=ebay_listing['title'],
                    card_set=card_set,
                    card_number=card_number,
                    language=language_extracted
                )
                db.add(card)
                db.flush()
            
            # Trouver ou créer le listing
            listing = db.query(Listing).filter(
                Listing.ebay_item_id == ebay_listing['ebay_item_id']
            ).first()
            
            if listing:
                # Mettre à jour le listing existant
                listing.price = ebay_listing['price']
                listing.shipping_cost = ebay_listing.get('shipping_cost', 0.0)
                listing.is_active = True
                listing.updated_at = datetime.utcnow()
            else:
                # Créer un nouveau listing
                listing = Listing(
                    card_id=card.id,
                    ebay_item_id=ebay_listing['ebay_item_id'],
                    title=ebay_listing['title'],
                    price=ebay_listing['price'],
                    shipping_cost=ebay_listing.get('shipping_cost', 0.0),
                    listing_url=ebay_listing.get('url'),
                    psa_grade=psa_grade_extracted or psa_grade,
                    condition=ebay_listing.get('condition'),
                    is_active=True
                )
                db.add(listing)
            
            updated_count += 1
        
        db.commit()
        logger.info(f"Mis à jour {updated_count} listings")
        
        return updated_count
    
    def detect_opportunities(self, db: Session) -> List[Opportunity]:
        """
        Détecte les opportunités d'arbitrage en comparant les listings actifs
        avec les prix planchers calculés.
        
        Returns:
            Liste des nouvelles opportunités créées
        """
        logger.info("Détection des opportunités d'arbitrage...")
        
        # Récupérer tous les listings actifs
        active_listings = db.query(Listing).filter(
            Listing.is_active == True
        ).all()
        
        new_opportunities = []
        
        for listing in active_listings:
            # Récupérer les ventes pour cette carte
            sales_query = db.query(Sale).filter(
                Sale.card_id == listing.card_id
            )
            
            # Filtrer par grade PSA si disponible
            if listing.psa_grade:
                sales_query = sales_query.filter(Sale.psa_grade == listing.psa_grade)
            
            sales = sales_query.all()
            
            if not sales:
                continue
            
            # Convertir en format dict pour le calculateur
            sales_data = [
                {
                    'price': sale.price,
                    'sold_date': sale.sold_date,
                    'psa_grade': sale.psa_grade,
                    'language': listing.card.language
                }
                for sale in sales
            ]
            
            # Calculer le prix plancher
            floor_price = self.floor_calculator.calculate_floor_price(
                sales_data,
                psa_grade=listing.psa_grade,
                language=listing.card.language
            )
            
            if not floor_price:
                continue
            
            # Vérifier si c'est une opportunité (listing_price < threshold * floor_price)
            listing_total = listing.price + listing.shipping_cost
            
            if listing_total < self.arbitrage_threshold * floor_price:
                # Calculer le profit estimé
                estimated_sale_price = floor_price
                gross_profit = estimated_sale_price - listing_total
                
                # Frais eBay sur la vente
                ebay_fees = estimated_sale_price * self.ebay_fee_rate
                
                # Coût de shipping pour la revente
                resale_shipping = self.shipping_cost
                
                # Profit net
                net_profit = gross_profit - ebay_fees - resale_shipping
                
                # Marge de profit (%)
                profit_margin = (net_profit / listing_total * 100) if listing_total > 0 else 0
                
                # Pourcentage de réduction vs floor
                discount_percentage = ((floor_price - listing_total) / floor_price * 100) if floor_price > 0 else 0
                
                # Vérifier si l'opportunité existe déjà
                existing_opp = db.query(Opportunity).filter(
                    Opportunity.listing_id == listing.id,
                    Opportunity.is_active == True
                ).first()
                
                if existing_opp:
                    # Mettre à jour l'opportunité existante
                    existing_opp.listing_price = listing_total
                    existing_opp.floor_price = floor_price
                    existing_opp.discount_percentage = discount_percentage
                    existing_opp.estimated_gross_profit = gross_profit
                    existing_opp.estimated_net_profit = net_profit
                    existing_opp.profit_margin = profit_margin
                    existing_opp.updated_at = datetime.utcnow()
                else:
                    # Créer une nouvelle opportunité
                    opportunity = Opportunity(
                        card_id=listing.card_id,
                        listing_id=listing.id,
                        listing_price=listing_total,
                        floor_price=floor_price,
                        discount_percentage=discount_percentage,
                        estimated_gross_profit=gross_profit,
                        estimated_net_profit=net_profit,
                        profit_margin=profit_margin,
                        is_active=True,
                        alerted=False
                    )
                    db.add(opportunity)
                    new_opportunities.append(opportunity)
        
        db.commit()
        logger.info(f"Détecté {len(new_opportunities)} nouvelles opportunités")
        
        return new_opportunities

