from fastapi import FastAPI
from app.core.database import engine, Base
from app.api.routes import router
import logging

# Configurer le logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Créer les tables (pour le développement, utiliser Alembic en production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="eBay Arbitrage Bot",
    description="Bot d'arbitrage pour cartes à collectionner (Pokémon PSA)",
    version="1.0.0"
)

app.include_router(router, prefix="/api", tags=["api"])


@app.get("/")
async def root():
    return {
        "message": "eBay Arbitrage Bot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

