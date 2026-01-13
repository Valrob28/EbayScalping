from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False, index=True)
    
    # eBay data
    ebay_item_id = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)  # Prix de vente final
    shipping_cost = Column(Float, default=0.0)
    sold_date = Column(DateTime, nullable=False, index=True)
    
    # Grading info
    psa_grade = Column(String)  # "PSA 9", "PSA 10", etc.
    condition = Column(String)  # "Near Mint", "Mint", etc.
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    card = relationship("Card", back_populates="sales")
    
    # Index pour requêtes fréquentes
    __table_args__ = (
        Index("idx_sale_card_sold_date", "card_id", "sold_date"),
        Index("idx_sale_psa_grade", "psa_grade"),
    )
    
    def __repr__(self):
        return f"<Sale(id={self.id}, card_id={self.card_id}, price={self.price}, date={self.sold_date})>"

