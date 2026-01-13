from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas import (
    CardResponse,
    SaleResponse,
    ListingResponse,
    OpportunityResponse
)
from app.models import Card, Sale, Listing, Opportunity
from app.services.arbitrage_service import ArbitrageService
from app.services.alert_service import AlertService

router = APIRouter()
arbitrage_service = ArbitrageService()
alert_service = AlertService()


@router.get("/cards", response_model=List[CardResponse])
async def get_cards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère la liste des cartes enregistrées"""
    cards = db.query(Card).offset(skip).limit(limit).all()
    return cards


@router.get("/cards/{card_id}", response_model=CardResponse)
async def get_card(card_id: int, db: Session = Depends(get_db)):
    """Récupère une carte par son ID"""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Carte non trouvée")
    return card


@router.get("/cards/{card_id}/sales", response_model=List[SaleResponse])
async def get_card_sales(
    card_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère les ventes d'une carte"""
    sales = db.query(Sale).filter(
        Sale.card_id == card_id
    ).order_by(Sale.sold_date.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/sales", response_model=List[SaleResponse])
async def get_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère toutes les ventes"""
    sales = db.query(Sale).order_by(Sale.sold_date.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère les listings"""
    query = db.query(Listing)
    if active_only:
        query = query.filter(Listing.is_active == True)
    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()
    return listings


@router.get("/opportunities", response_model=List[OpportunityResponse])
async def get_opportunities(
    active_only: bool = True,
    min_profit_margin: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère les opportunités d'arbitrage"""
    query = db.query(Opportunity)
    
    if active_only:
        query = query.filter(Opportunity.is_active == True)
    
    if min_profit_margin is not None:
        query = query.filter(Opportunity.profit_margin >= min_profit_margin)
    
    opportunities = query.order_by(
        Opportunity.profit_margin.desc()
    ).offset(skip).limit(limit).all()
    
    return opportunities


@router.post("/fetch-sales")
async def fetch_sales(
    search_query: str,
    psa_grade: Optional[str] = None,
    language: str = "EN",
    days_back: int = 30,
    db: Session = Depends(get_db)
):
    """
    Récupère les ventes complétées depuis eBay et les stocke en DB.
    """
    count = await arbitrage_service.fetch_and_store_sales(
        db=db,
        search_query=search_query,
        psa_grade=psa_grade,
        language=language,
        days_back=days_back
    )
    return {"message": f"{count} ventes ajoutées", "count": count}


@router.post("/fetch-listings")
async def fetch_listings(
    search_query: str,
    psa_grade: Optional[str] = None,
    language: str = "EN",
    db: Session = Depends(get_db)
):
    """
    Récupère les listings actifs depuis eBay et les stocke en DB.
    """
    count = await arbitrage_service.fetch_and_store_listings(
        db=db,
        search_query=search_query,
        psa_grade=psa_grade,
        language=language
    )
    return {"message": f"{count} listings mis à jour", "count": count}


@router.post("/detect-opportunities")
async def detect_opportunities(
    send_alerts: bool = True,
    db: Session = Depends(get_db)
):
    """
    Détecte les opportunités d'arbitrage et envoie des alertes si demandé.
    """
    new_opportunities = arbitrage_service.detect_opportunities(db)
    
    if send_alerts and new_opportunities:
        await alert_service.send_batch_alerts(new_opportunities)
        # Marquer les opportunités comme alertées
        for opp in new_opportunities:
            opp.alerted = True
        db.commit()
    
    return {
        "message": f"{len(new_opportunities)} nouvelles opportunités détectées",
        "count": len(new_opportunities)
    }


@router.post("/run-full-scan")
async def run_full_scan(
    search_query: str,
    psa_grade: Optional[str] = None,
    language: str = "EN",
    days_back: int = 30,
    send_alerts: bool = True,
    db: Session = Depends(get_db)
):
    """
    Exécute un scan complet:
    1. Récupère les ventes complétées
    2. Récupère les listings actifs
    3. Détecte les opportunités
    4. Envoie les alertes
    """
    # 1. Récupérer les ventes
    sales_count = await arbitrage_service.fetch_and_store_sales(
        db=db,
        search_query=search_query,
        psa_grade=psa_grade,
        language=language,
        days_back=days_back
    )
    
    # 2. Récupérer les listings
    listings_count = await arbitrage_service.fetch_and_store_listings(
        db=db,
        search_query=search_query,
        psa_grade=psa_grade,
        language=language
    )
    
    # 3. Détecter les opportunités
    opportunities = arbitrage_service.detect_opportunities(db)
    
    # 4. Envoyer les alertes
    if send_alerts and opportunities:
        await alert_service.send_batch_alerts(opportunities)
        for opp in opportunities:
            opp.alerted = True
        db.commit()
    
    return {
        "message": "Scan complet terminé",
        "sales_added": sales_count,
        "listings_updated": listings_count,
        "opportunities_found": len(opportunities)
    }

