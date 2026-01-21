from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Market API",
    version="1.0.0"
)

# CORS (obligatoire pour Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en prod tu pourras restreindre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}

# ============================
# DASHBOARD MARKET STATS
# ============================

@app.get("/api/dashboard/market-stats")
def get_market_stats():
    return {
        "total_cards": 1250,
        "total_sales": 4567,
        "total_listings": 234,
        "total_volume": 1250000,
        "volume_24h": 12450.50,
        "volume_7d": 85000,
        "volume_30d": 350000,
        "average_by_language": [
            {
                "language": "EN",
                "average_price": 285.50,
                "sales_count": 2800
            },
            {
                "language": "JP",
                "average_price": 425.75,
                "sales_count": 1200
            },
            {
                "language": "FR",
                "average_price": 195.25,
                "sales_count": 450
            },
            {
                "language": "DE",
