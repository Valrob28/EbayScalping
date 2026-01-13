from pydantic import BaseModel
from datetime import datetime


class OpportunityResponse(BaseModel):
    id: int
    card_id: int
    listing_id: int
    listing_price: float
    floor_price: float
    discount_percentage: float
    estimated_gross_profit: float
    estimated_net_profit: float
    profit_margin: float
    is_active: bool
    alerted: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

