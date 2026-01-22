from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import Card, Sale, Listing, Opportunity

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/market-stats")
async def get_market_stats(db: Session = Depends(get_db)):
    """
    Statistiques globales du marché
    """
    # Total cards
    total_cards = db.query(Card).count()
    
    # Total sales
    total_sales = db.query(Sale).count()
    
    # Total active listings
    total_listings = db.query(Listing).filter(Listing.is_active == True).count()
    
    # Total volume
    total_volume = db.query(func.sum(Sale.price)).scalar() or 0
    
    # Volume 24h
    yesterday = datetime.utcnow() - timedelta(days=1)
    volume_24h = db.query(func.sum(Sale.price)).filter(
        Sale.sold_date >= yesterday
    ).scalar() or 0
    
    # Volume 7d
    week_ago = datetime.utcnow() - timedelta(days=7)
    volume_7d = db.query(func.sum(Sale.price)).filter(
        Sale.sold_date >= week_ago
    ).scalar() or 0
    
    # Volume 30d
    month_ago = datetime.utcnow() - timedelta(days=30)
    volume_30d = db.query(func.sum(Sale.price)).filter(
        Sale.sold_date >= month_ago
    ).scalar() or 0
    
    # Average by language
    average_by_language = db.query(
        Card.language,
        func.avg(Sale.price).label('average_price'),
        func.count(Sale.id).label('sales_count')
    ).join(Sale).group_by(Card.language).all()
    
    return {
        "total_cards": total_cards,
        "total_sales": total_sales,
        "total_listings": total_listings,
        "total_volume": float(total_volume),
        "volume_24h": float(volume_24h),
        "volume_7d": float(volume_7d),
        "volume_30d": float(volume_30d),
        "average_by_language": [
            {
                "language": lang,
                "average_price": float(avg or 0),
                "sales_count": count
            }
            for lang, avg, count in average_by_language
        ]
    }


@router.get("/market-overview")
async def get_market_overview(db: Session = Depends(get_db)):
    """
    Vue d'ensemble du marché avec top movers
    """
    # Get market stats
    stats = await get_market_stats(db)
    
    # Get top opportunities
    total_opportunities = db.query(Opportunity).filter(
        Opportunity.is_active == True
    ).count()
    
    # Get sales in last 24h
    yesterday = datetime.utcnow() - timedelta(days=1)
    sales_24h = db.query(Sale).filter(Sale.sold_date >= yesterday).count()
    
    # Get top movers (cards with highest price changes)
    # Simplified version - just get cards with most recent sales
    week_ago = datetime.utcnow() - timedelta(days=7)
    top_movers = db.query(
        Card.id,
        Card.normalized_name,
        func.avg(Sale.price).label('current_price'),
        func.count(Sale.id).label('volume_7d')
    ).join(Sale).filter(
        Sale.sold_date >= week_ago
    ).group_by(Card.id, Card.normalized_name).order_by(
        desc('volume_7d')
    ).limit(5).all()
    
    return {
        "total_cards": stats["total_cards"],
        "total_opportunities": total_opportunities,
        "total_volume_24h": stats["volume_24h"],
        "sales_24h": sales_24h,
        "top_movers": [
            {
                "card_id": card_id,
                "card_name": name,
                "current_price": float(price or 0),
                "change_24h": 5.0,  # Placeholder
                "volume_7d": volume,
                "trend": "up"
            }
            for card_id, name, price, volume in top_movers
        ]
    }


@router.get("/hot-opportunities")
async def get_hot_opportunities(
    limit: int = Query(10, ge=1, le=50),
    min_roi: float = Query(15.0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Opportunités chaudes (meilleur ROI)
    """
    opportunities = db.query(Opportunity).join(
        Card, Opportunity.card_id == Card.id
    ).join(
        Listing, Opportunity.listing_id == Listing.id
    ).filter(
        Opportunity.is_active == True,
        Opportunity.profit_margin >= min_roi
    ).order_by(
        desc(Opportunity.profit_margin)
    ).limit(limit).all()
    
    result = []
    for opp in opportunities:
        # Get volume 30d
        month_ago = datetime.utcnow() - timedelta(days=30)
        volume_30d = db.query(func.count(Sale.id)).filter(
            Sale.card_id == opp.card_id,
            Sale.sold_date >= month_ago
        ).scalar() or 0
        
        result.append({
            "id": opp.id,
            "card_name": opp.card.normalized_name,
            "card_set": opp.card.card_set or "Unknown",
            "language": opp.card.language,
            "grade": opp.listing.psa_grade or "Raw",
            "floor_price": opp.floor_price,
            "listing_price": opp.listing_price,
            "profit_margin": opp.profit_margin,
            "estimated_net_profit": opp.estimated_net_profit,
            "volume_30d": volume_30d,
            "ebay_url": opp.listing.listing_url or f"https://ebay.com/itm/{opp.listing.ebay_item_id}",
            "image_url": f"https://i.ebayimg.com/images/g/{opp.listing.ebay_item_id}/s-l500.jpg",
            "trending": volume_30d > 10
        })
    
    return result


@router.get("/trending-cards")
async def get_trending_cards(
    limit: int = Query(10, ge=1, le=50),
    timeframe: str = Query("7d", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db)
):
    """
    Cartes tendance basées sur le volume de ventes
    """
    # Calculate days based on timeframe
    days_map = {"24h": 1, "7d": 7, "30d": 30}
    days = days_map[timeframe]
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get cards with most sales in timeframe
    trending = db.query(
        Card.id,
        Card.normalized_name,
        Card.card_set,
        Card.language,
        func.count(Sale.id).label('sales_count'),
        func.avg(Sale.price).label('average_price'),
        func.max(Sale.price).label('max_price')
    ).join(Sale).filter(
        Sale.sold_date >= cutoff_date
    ).group_by(
        Card.id, Card.normalized_name, Card.card_set, Card.language
    ).order_by(
        desc('sales_count')
    ).limit(limit).all()
    
    return {
        "timeframe": timeframe,
        "cards": [
            {
                "card_id": card_id,
                "card_name": name,
                "card_set": card_set or "Unknown",
                "language": language,
                "sales_count": sales,
                "average_price": float(avg or 0),
                "max_price": float(max_price or 0),
                "image_url": f"https://via.placeholder.com/64x80"
            }
            for card_id, name, card_set, language, sales, avg, max_price in trending
        ]
    }


@router.get("/price-history/{card_id}")
async def get_price_history(
    card_id: int,
    days: int = Query(30, ge=1, le=365),
    interval: str = Query("daily", regex="^(daily|weekly)$"),
    db: Session = Depends(get_db)
):
    """
    Historique des prix pour une carte
    """
    # Get card
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        return {"error": "Card not found"}
    
    # Get sales in timeframe
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    sales = db.query(Sale).filter(
        Sale.card_id == card_id,
        Sale.sold_date >= cutoff_date
    ).order_by(Sale.sold_date).all()
    
    if not sales:
        return {
            "card_id": card_id,
            "card_name": card.normalized_name,
            "card_set": card.card_set,
            "language": card.language,
            "interval": interval,
            "days": days,
            "data": [],
            "total_sales": 0,
            "current_floor": 0,
            "highest_sale": 0,
            "lowest_sale": 0,
            "average_price": 0
        }
    
    # Group by day
    price_data = {}
    for sale in sales:
        date_key = sale.sold_date.date().isoformat()
        if date_key not in price_data:
            price_data[date_key] = {
                "prices": [],
                "date": date_key
            }
        price_data[date_key]["prices"].append(sale.price)
    
    # Calculate OHLC for each day
    data = []
    for date_key, day_data in sorted(price_data.items()):
        prices = day_data["prices"]
        data.append({
            "date": date_key,
            "open": prices[0],
            "high": max(prices),
            "low": min(prices),
            "close": prices[-1],
            "volume": len(prices),
            "average": sum(prices) / len(prices)
        })
    
    # Calculate stats
    all_prices = [s.price for s in sales]
    
    return {
        "card_id": card_id,
        "card_name": card.normalized_name,
        "card_set": card.card_set or "Unknown",
        "language": card.language,
        "interval": interval,
        "days": days,
        "data": data,
        "total_sales": len(sales),
        "current_floor": min(all_prices),
        "highest_sale": max(all_prices),
        "lowest_sale": min(all_prices),
        "average_price": sum(all_prices) / len(all_prices)
    }
