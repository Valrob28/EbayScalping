from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes, dashboard_routes

app = FastAPI(
    title="eBay Arbitrage API",
    version="1.0.0",
    description="API pour l'arbitrage de cartes à collectionner"
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTES
# =========================
app.include_router(routes.router, prefix="/api", tags=["api"])
app.include_router(dashboard_routes.router, prefix="/api", tags=["dashboard"])

# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "eBay Arbitrage API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "api": "/api",
            "dashboard": "/api/dashboard"
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
