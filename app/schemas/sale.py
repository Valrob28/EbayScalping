from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SaleCreate(BaseModel):
    card_id: int
    ebay_item_id: str
    title: str
    price: float
    shipping_cost: float = 0.0
    sold_date: datetime
    psa_grade: Optional[str] = None
    condition: Optional[str] = None


class SaleResponse(BaseModel):
    id: int
    card_id: int
    ebay_item_id: str
    title: str
    price: float
    shipping_cost: float
    sold_date: datetime
    psa_grade: Optional[str]
    condition: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

