from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ListingCreate(BaseModel):
    card_id: int
    ebay_item_id: str
    title: str
    price: float
    shipping_cost: float = 0.0
    listing_url: Optional[str] = None
    psa_grade: Optional[str] = None
    condition: Optional[str] = None
    is_active: bool = True


class ListingResponse(BaseModel):
    id: int
    card_id: int
    ebay_item_id: str
    title: str
    price: float
    shipping_cost: float
    listing_url: Optional[str]
    psa_grade: Optional[str]
    condition: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

