from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    
    # eBay data
    ebay_item_id = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)  # Prix actuel du listing
    shipping_cost = Column(Float, default=0.0)
    listing_url = Column(String)
    
    # Grading info
    psa_grade = Column(String)  # "PSA 9", "PSA 10", etc.
    condition = Column(String)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    ended_at = Column(DateTime, nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    card = relationship("Card", back_populates="listings")
    
    # Index pour recherche active listings
    __table_args__ = (
        Index("idx_listing_card_active", "card_id", "is_active"),
    )
    
    def __repr__(self):
        return f"<Listing(id={self.id}, card_id={self.card_id}, price={self.price}, active={self.is_active})>"

