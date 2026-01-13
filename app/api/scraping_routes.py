"""
Routes API pour le scraping eBay (à utiliser avec précaution).

⚠️ AVERTISSEMENT : Le scraping peut violer les ToS d'eBay.
Utilisez uniquement si les APIs officielles ne suffisent pas.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.ebay_scraper import eBayScraper
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scraping", tags=["scraping"])


@router.post("/completed-sales")
async def scrape_completed_sales(
    search_query: str = Query(..., description="Terme de recherche"),
    max_results: int = Query(50, ge=1, le=100, description="Nombre maximum de résultats"),
    days_back: int = Query(30, ge=1, le=90, description="Nombre de jours en arrière"),
    use_scraper: bool = Query(False, description="⚠️ Forcer l'utilisation du scraper")
):
    """
    ⚠️ Scrape les ventes complétées depuis eBay.
    
    **AVERTISSEMENT** : Cette route utilise le scraping web qui peut :
    - Violer les Conditions d'Utilisation d'eBay
    - Être bloqué par eBay (CAPTCHA, IP blocking)
    - Être moins fiable que l'API officielle
    
    **Recommandation** : Utilisez `/api/fetch-sales` qui utilise l'API officielle.
    
    Cette route est fournie uniquement comme fallback si l'API officielle
    ne fournit pas les données nécessaires.
    """
    if not use_scraper:
        raise HTTPException(
            status_code=400,
            detail="Le scraping doit être explicitement activé avec use_scraper=true. "
                   "Utilisez /api/fetch-sales pour l'API officielle."
        )
    
    try:
        scraper = eBayScraper()
        results = await scraper.scrape_completed_listings(
            search_query=search_query,
            max_results=max_results,
            days_back=days_back
        )
        
        return {
            "message": f"Scrapé {len(results)} résultats",
            "count": len(results),
            "results": results,
            "warning": "Données obtenues via scraping web. Utilisez avec précaution."
        }
    except Exception as e:
        logger.error(f"Erreur lors du scraping: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du scraping: {str(e)}"
        )


@router.get("/listing/{item_id}")
async def scrape_listing_details(
    item_id: str,
    use_scraper: bool = Query(False, description="⚠️ Forcer l'utilisation du scraper")
):
    """
    ⚠️ Scrape les détails d'un listing spécifique.
    
    **AVERTISSEMENT** : Voir `/scraping/completed-sales` pour les warnings.
    """
    if not use_scraper:
        raise HTTPException(
            status_code=400,
            detail="Le scraping doit être explicitement activé avec use_scraper=true"
        )
    
    try:
        scraper = eBayScraper()
        details = await scraper.scrape_listing_details(item_id)
        
        if not details:
            raise HTTPException(status_code=404, detail="Listing non trouvé")
        
        return {
            "details": details,
            "warning": "Données obtenues via scraping web. Utilisez avec précaution."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du scraping: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du scraping: {str(e)}"
        )

