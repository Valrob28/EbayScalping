from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CardCreate(BaseModel):
    normalized_name: str
    raw_name: Optional[str] = None
    card_set: Optional[str] = None
    card_number: Optional[str] = None
    language: str = "EN"


class CardResponse(BaseModel):
    id: int
    normalized_name: str
    raw_name: Optional[str]
    card_set: Optional[str]
    card_number: Optional[str]
    language: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

