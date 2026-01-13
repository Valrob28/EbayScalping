from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database - SQLite par défaut pour le développement
    database_url: str = "sqlite:///./ebay_arbitrage.db"
    
    # eBay API - Optionnel si on utilise le scraping
    ebay_app_id: Optional[str] = None
    ebay_client_id: Optional[str] = None
    ebay_client_secret: Optional[str] = None
    ebay_redirect_uri: Optional[str] = None
    
    # Mode scraping (par défaut si pas de clés API)
    use_scraping_mode: bool = True  # Utiliser le scraping par défaut
    
    # OpenAI (optional)
    openai_api_key: Optional[str] = None
    
    # Redis (optional)
    redis_url: Optional[str] = None
    
    # Telegram (optional)
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    
    # Configuration
    shipping_cost: float = 5.0
    arbitrage_threshold: float = 0.8  # listing_price < threshold * floor_price
    min_sales_for_floor: int = 5
    max_sales_for_floor: int = 10
    ebay_fee_rate: float = 0.13  # 13% eBay fees
    
    # Scraping - Mode principal si pas de clés API
    use_scraper_fallback: bool = True  # Utiliser le scraper si l'API échoue ou n'est pas disponible
    scraperapi_key: Optional[str] = None  # Pour services tiers légaux
    scraping_delay: float = 2.0  # Délai entre requêtes (secondes)
    scraping_max_requests_per_hour: int = 100  # Limite de requêtes par heure
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

