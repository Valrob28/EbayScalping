"""
Script d'exemple pour utiliser le bot d'arbitrage.
"""
import asyncio
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.arbitrage_service import ArbitrageService
from app.services.alert_service import AlertService


async def main():
    """
    Exemple d'utilisation du bot d'arbitrage.
    """
    db: Session = SessionLocal()
    arbitrage_service = ArbitrageService()
    alert_service = AlertService()
    
    try:
        # Exemple 1: Récupérer les ventes complétées pour Charizard PSA 10
        print("=" * 60)
        print("1. Récupération des ventes complétées...")
        print("=" * 60)
        
        sales_count = await arbitrage_service.fetch_and_store_sales(
            db=db,
            search_query="Pokemon Charizard PSA 10",
            psa_grade="PSA 10",
            language="EN",
            days_back=30
        )
        print(f"✓ {sales_count} ventes ajoutées\n")
        
        # Exemple 2: Récupérer les listings actifs
        print("=" * 60)
        print("2. Récupération des listings actifs...")
        print("=" * 60)
        
        listings_count = await arbitrage_service.fetch_and_store_listings(
            db=db,
            search_query="Pokemon Charizard PSA 10",
            psa_grade="PSA 10",
            language="EN"
        )
        print(f"✓ {listings_count} listings mis à jour\n")
        
        # Exemple 3: Détecter les opportunités
        print("=" * 60)
        print("3. Détection des opportunités d'arbitrage...")
        print("=" * 60)
        
        opportunities = arbitrage_service.detect_opportunities(db)
        print(f"✓ {len(opportunities)} opportunités détectées\n")
        
        # Exemple 4: Envoyer les alertes
        if opportunities:
            print("=" * 60)
            print("4. Envoi des alertes...")
            print("=" * 60)
            await alert_service.send_batch_alerts(opportunities)
            
            # Marquer comme alertées
            for opp in opportunities:
                opp.alerted = True
            db.commit()
        
        print("\n" + "=" * 60)
        print("Scan terminé avec succès!")
        print("=" * 60)
        
    except Exception as e:
        print(f"Erreur: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())

