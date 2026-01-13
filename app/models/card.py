from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    normalized_name = Column(String, nullable=False, index=True)  # Nom normalisé unique
    raw_name = Column(String)  # Nom original pour référence
    card_set = Column(String)  # Ex: "Base Set", "Jungle", etc.
    card_number = Column(String)  # Numéro dans le set
    language = Column(String, default="EN")  # EN, JP, etc.
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    sales = relationship("Sale", back_populates="card", cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="card", cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="card", cascade="all, delete-orphan")
    
    # Index composite pour recherche rapide
    __table_args__ = (
        Index("idx_card_normalized_lang", "normalized_name", "language"),
    )
    
    def __repr__(self):
        return f"<Card(id={self.id}, name='{self.normalized_name}', lang='{self.language}')>"

