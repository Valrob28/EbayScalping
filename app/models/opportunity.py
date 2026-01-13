from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    
    # Pricing
    listing_price = Column(Float, nullable=False)
    floor_price = Column(Float, nullable=False)  # Prix plancher calculé
    discount_percentage = Column(Float, nullable=False)  # % de réduction vs floor
    
    # Profit estimation
    estimated_gross_profit = Column(Float, nullable=False)
    estimated_net_profit = Column(Float, nullable=False)  # Après frais eBay et shipping
    profit_margin = Column(Float, nullable=False)  # % de marge
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    alerted = Column(Boolean, default=False)  # Si une alerte a été envoyée
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    card = relationship("Card", back_populates="opportunities")
    
    # Index pour recherche d'opportunités actives
    __table_args__ = (
        Index("idx_opp_card_active", "card_id", "is_active"),
        Index("idx_opp_profit_margin", "profit_margin"),
    )
    
    def __repr__(self):
        return f"<Opportunity(id={self.id}, card_id={self.card_id}, profit={self.estimated_net_profit:.2f})>"

