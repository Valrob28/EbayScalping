from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str
    
    # eBay API
    ebay_app_id: str
    ebay_client_id: str
    ebay_client_secret: str
    ebay_redirect_uri: Optional[str] = None
    
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
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

