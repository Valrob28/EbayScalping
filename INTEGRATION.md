# Guide d'Intégration Frontend/Backend

Ce guide explique comment connecter l'interface web Next.js au backend FastAPI.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Next.js App   │ ──────> │  Next.js API    │ ──────> │  FastAPI    │
│   (Port 3000)   │         │   Routes (/api)  │         │ (Port 8000) │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

## Configuration

### Backend (FastAPI)

1. Démarrer le serveur FastAPI:
```bash
cd /Users/valentin/EbayScalping
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Vérifier que l'API fonctionne:
```bash
curl http://localhost:8000/api/opportunities
```

### Frontend (Next.js)

1. Installer les dépendances:
```bash
cd web
npm install
```

2. Configurer l'URL du backend dans `.env.local`:
```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

3. Démarrer le serveur de développement:
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Endpoints API

### Backend FastAPI → Frontend Next.js

Le frontend Next.js expose des routes API qui font le pont avec FastAPI:

#### `GET /api/opportunities`
Récupère toutes les opportunités d'arbitrage.

**Réponse attendue:**
```json
[
  {
    "id": 1,
    "card_name": "Charizard Base Set",
    "game": "Pokémon",
    "image_url": "https://...",
    "floor_price": 450.0,
    "listing_price": 320.0,
    "roi": 28.9,
    "language": "EN",
    "grade": "PSA 10",
    "ebay_url": "https://ebay.com/itm/123",
    "sales_history": [...]
  }
]
```

#### `GET /api/card/[id]`
Récupère les détails d'une carte spécifique avec son historique de ventes.

## Transformation des Données

Le backend FastAPI retourne des données dans ce format:
```json
{
  "id": 1,
  "card_id": 5,
  "listing_id": 10,
  "floor_price": 450.0,
  "listing_price": 320.0,
  "profit_margin": 28.9,
  "card": {
    "normalized_name": "Charizard Base Set",
    "language": "EN"
  },
  "listing": {
    "ebay_item_id": "123",
    "listing_url": "https://ebay.com/itm/123",
    "psa_grade": "PSA 10"
  }
}
```

Les routes API Next.js transforment ces données en format attendu par le frontend:
```json
{
  "id": 1,
  "card_name": "Charizard Base Set",
  "game": "Pokémon",
  "image_url": "...",
  "floor_price": 450.0,
  "listing_price": 320.0,
  "roi": 28.9,
  "language": "EN",
  "grade": "PSA 10",
  "ebay_url": "https://ebay.com/itm/123",
  "sales_history": []
}
```

## Améliorations du Backend pour Meilleure Intégration

Pour une intégration complète, le backend FastAPI devrait exposer:

### 1. Endpoint enrichi pour les opportunités

Modifier `/app/api/routes.py` pour ajouter:

```python
@router.get("/opportunities/enriched", response_model=List[dict])
async def get_enriched_opportunities(
    active_only: bool = True,
    min_profit_margin: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Retourne les opportunités avec toutes les données nécessaires pour le frontend"""
    query = db.query(Opportunity)
    
    if active_only:
        query = query.filter(Opportunity.is_active == True)
    
    if min_profit_margin is not None:
        query = query.filter(Opportunity.profit_margin >= min_profit_margin)
    
    opportunities = query.all()
    
    result = []
    for opp in opportunities:
        # Récupérer les ventes récentes pour l'historique
        sales = db.query(Sale).filter(
            Sale.card_id == opp.card_id
        ).order_by(Sale.sold_date.desc()).limit(30).all()
        
        result.append({
            "id": opp.id,
            "card_name": opp.card.normalized_name,
            "game": "Pokémon",  # À déterminer depuis les données
            "image_url": f"https://i.ebayimg.com/images/g/{opp.listing.ebay_item_id}/s-l500.jpg",
            "floor_price": opp.floor_price,
            "listing_price": opp.listing_price,
            "roi": opp.profit_margin,
            "language": opp.card.language,
            "grade": opp.listing.psa_grade or "Raw",
            "ebay_url": opp.listing.listing_url or f"https://ebay.com/itm/{opp.listing.ebay_item_id}",
            "sales_history": [
                {
                    "date": sale.sold_date.isoformat(),
                    "price": sale.price
                }
                for sale in sales
            ]
        })
    
    return result
```

### 2. Ajouter le champ `game` au modèle Card

Modifier `/app/models/card.py`:

```python
game = Column(String, default="Pokémon")  # Pokémon, One Piece Card Game, Yu-Gi-Oh!
```

### 3. Endpoint pour les images eBay

Créer un endpoint pour récupérer les URLs d'images depuis eBay:

```python
@router.get("/listings/{listing_id}/image")
async def get_listing_image(listing_id: int, db: Session = Depends(get_db)):
    """Récupère l'URL de l'image d'un listing depuis eBay"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Utiliser l'API eBay Browse pour récupérer l'image
    # Ou construire l'URL depuis l'item_id
    image_url = f"https://i.ebayimg.com/images/g/{listing.ebay_item_id}/s-l500.jpg"
    
    return {"image_url": image_url}
```

## Mode Développement avec Données Mock

Si le backend FastAPI n'est pas disponible, l'application Next.js utilise automatiquement des données mock définies dans `/web/app/api/opportunities/route.ts`.

## Déploiement

### Backend (FastAPI)
- Déployer sur un service comme Railway, Render, ou Heroku
- Configurer la variable d'environnement `DATABASE_URL`
- Exposer le port 8000

### Frontend (Next.js)
- Déployer sur Vercel (recommandé) ou autre service
- Configurer `NEXT_PUBLIC_FASTAPI_URL` avec l'URL du backend déployé
- Vercel détecte automatiquement Next.js et configure le build

## Dépannage

### Le frontend n'affiche pas de données
1. Vérifier que le backend FastAPI est démarré
2. Vérifier l'URL dans `.env.local`
3. Vérifier les logs du navigateur (F12) pour les erreurs CORS
4. Vérifier que les endpoints FastAPI retournent bien des données

### Erreurs CORS
Ajouter dans `/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Les images ne s'affichent pas
1. Vérifier que les URLs d'images eBay sont valides
2. Configurer `next.config.js` pour autoriser les domaines eBay
3. Utiliser des placeholders si les images ne sont pas disponibles

