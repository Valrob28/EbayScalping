from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.routes import router
import logging
import os

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

# Configuration CORS pour permettre les requêtes depuis le frontend
frontend_urls = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Ajouter l'URL du frontend depuis les variables d'environnement si disponible
if os.getenv("FRONTEND_URL"):
    frontend_urls.append(os.getenv("FRONTEND_URL"))

# En production, accepter toutes les origines (à restreindre pour la sécurité)
# Pour plus de sécurité, spécifier les domaines exacts dans FRONTEND_URL
if os.getenv("ENVIRONMENT") == "production" or os.getenv("RENDER"):
    # Accepter toutes les origines en développement/production
    # En production réelle, utiliser une liste spécifique de domaines
    frontend_urls = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["api"])

# Routes de scraping (optionnel, avec avertissements)
try:
    from app.api.scraping_routes import router as scraping_router
    app.include_router(scraping_router, prefix="/api")
except ImportError:
    logger.warning("Routes de scraping non disponibles (beautifulsoup4 non installé)")


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

