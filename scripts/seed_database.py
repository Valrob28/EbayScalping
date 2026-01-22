"""
Script pour ajouter des données de test dans la base de données
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models import Card, Sale, Listing, Opportunity
import random

def seed_database():
    db = SessionLocal()
    
    print("🌱 Ajout de données de test...")
    
    try:
        # Supprimer les données existantes
        db.query(Opportunity).delete()
        db.query(Listing).delete()
        db.query(Sale).delete()
        db.query(Card).delete()
        db.commit()
        
        # Créer des cartes
        cards_data = [
            {"name": "Charizard Base Set", "set": "Base Set", "number": "4", "language": "EN"},
            {"name": "Pikachu Illustrator", "set": "Promo", "number": "1", "language": "JP"},
            {"name": "Blastoise Base Set", "set": "Base Set", "number": "2", "language": "EN"},
            {"name": "Venusaur Base Set", "set": "Base Set", "number": "15", "language": "EN"},
            {"name": "Luffy Gear 5", "set": "OP-01", "number": "120", "language": "JP"},
            {"name": "Blue-Eyes White Dragon", "set": "LOB", "number": "001", "language": "EN"},
            {"name": "Mewtwo Base Set", "set": "Base Set", "number": "10", "language": "EN"},
            {"name": "Mew Ancient", "set": "Ancient Origins", "number": "29", "language": "EN"},
            {"name": "Rayquaza GX", "set": "Celestial Storm", "number": "109", "language": "EN"},
            {"name": "Zoro Premium", "set": "OP-02", "number": "025", "language": "JP"},
        ]
        
        cards = []
        for card_data in cards_data:
            card = Card(
                normalized_name=card_data["name"],
                raw_name=card_data["name"],
                card_set=card_data["set"],
                card_number=card_data["number"],
                language=card_data["language"]
            )
            db.add(card)
            cards.append(card)
        
        db.flush()
        print(f"✅ {len(cards)} cartes créées")
        
        # Créer des ventes pour chaque carte
        total_sales = 0
        for card in cards:
            # Base price pour la carte
            base_price = random.uniform(50, 500)
            
            # Créer 10-30 ventes sur les 30 derniers jours
            num_sales = random.randint(10, 30)
            
            for i in range(num_sales):
                days_ago = random.randint(0, 30)
                sold_date = datetime.utcnow() - timedelta(days=days_ago)
                
                # Prix avec variation
                price = base_price * random.uniform(0.7, 1.3)
                
                sale = Sale(
                    card_id=card.id,
                    ebay_item_id=f"SALE{card.id}{i:04d}",
                    title=f"{card.normalized_name} {card.card_set}",
                    price=round(price, 2),
                    shipping_cost=random.uniform(3, 10),
                    sold_date=sold_date,
                    psa_grade=random.choice(["PSA 10", "PSA 9", "PSA 8", None]),
                    condition=random.choice(["Mint", "Near Mint", "Excellent"])
                )
                db.add(sale)
                total_sales += 1
        
        db.flush()
        print(f"✅ {total_sales} ventes créées")
        
        # Créer des listings actifs
        total_listings = 0
        for card in cards:
            # 1-3 listings par carte
            num_listings = random.randint(1, 3)
            
            for i in range(num_listings):
                # Prix plus bas que le floor pour créer des opportunités
                listing_price = random.uniform(30, 400)
                
                listing = Listing(
                    card_id=card.id,
                    ebay_item_id=f"LIST{card.id}{i:04d}",
                    title=f"{card.normalized_name} {card.card_set}",
                    price=round(listing_price, 2),
                    shipping_cost=random.uniform(3, 10),
                    listing_url=f"https://ebay.com/itm/LIST{card.id}{i:04d}",
                    psa_grade=random.choice(["PSA 10", "PSA 9", "PSA 8", None]),
                    condition=random.choice(["Mint", "Near Mint", "Excellent"]),
                    is_active=True
                )
                db.add(listing)
                total_listings += 1
        
        db.flush()
        print(f"✅ {total_listings} listings créés")
        
        # Créer des opportunités pour les meilleurs deals
        total_opportunities = 0
        for card in cards:
            # Calculer un prix plancher simple (moyenne des ventes)
            sales = db.query(Sale).filter(Sale.card_id == card.id).all()
            if not sales:
                continue
            
            floor_price = sum(s.price for s in sales) / len(sales)
            
            # Trouver les listings avec bon ROI
            listings = db.query(Listing).filter(
                Listing.card_id == card.id,
                Listing.is_active == True
            ).all()
            
            for listing in listings:
                if listing.price < floor_price * 0.8:  # 20% de réduction minimum
                    profit_margin = ((floor_price - listing.price) / listing.price) * 100
                    net_profit = floor_price - listing.price - (floor_price * 0.13) - 5
                    
                    opportunity = Opportunity(
                        card_id=card.id,
                        listing_id=listing.id,
                        listing_price=listing.price,
                        floor_price=floor_price,
                        discount_percentage=((floor_price - listing.price) / floor_price) * 100,
                        estimated_gross_profit=floor_price - listing.price,
                        estimated_net_profit=net_profit,
                        profit_margin=profit_margin,
                        is_active=True,
                        alerted=False
                    )
                    db.add(opportunity)
                    total_opportunities += 1
        
        db.commit()
        print(f"✅ {total_opportunities} opportunités créées")
        
        print("\n🎉 Base de données remplie avec succès !")
        print(f"\nRésumé :")
        print(f"  - {len(cards)} cartes")
        print(f"  - {total_sales} ventes")
        print(f"  - {total_listings} listings")
        print(f"  - {total_opportunities} opportunités")
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
