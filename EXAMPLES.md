# Exemples d'utilisation

## Configuration initiale

1. Créer un fichier `.env` à partir de `.env.example`
2. Remplir vos clés API eBay
3. Créer la base de données PostgreSQL:
```bash
createdb ebay_arbitrage
```

4. Exécuter les migrations:
```bash
alembic upgrade head
```

## Utilisation via l'API REST

### Démarrer le serveur

```bash
uvicorn app.main:app --reload
```

L'API sera disponible sur `http://localhost:8000`
Documentation interactive: `http://localhost:8000/docs`

### Exemples de requêtes

#### 1. Récupérer les ventes complétées

```bash
curl -X POST "http://localhost:8000/api/fetch-sales?search_query=Pokemon%20Charizard%20PSA%2010&psa_grade=PSA%2010&language=EN&days_back=30"
```

#### 2. Récupérer les listings actifs

```bash
curl -X POST "http://localhost:8000/api/fetch-listings?search_query=Pokemon%20Charizard%20PSA%2010&psa_grade=PSA%2010&language=EN"
```

#### 3. Détecter les opportunités

```bash
curl -X POST "http://localhost:8000/api/detect-opportunities?send_alerts=true"
```

#### 4. Exécuter un scan complet

```bash
curl -X POST "http://localhost:8000/api/run-full-scan?search_query=Pokemon%20Charizard%20PSA%2010&psa_grade=PSA%2010&language=EN&days_back=30&send_alerts=true"
```

#### 5. Consulter les opportunités détectées

```bash
curl "http://localhost:8000/api/opportunities?active_only=true&min_profit_margin=10"
```

## Utilisation via script Python

```python
import asyncio
from app.core.database import SessionLocal
from app.services.arbitrage_service import ArbitrageService
from app.services.alert_service import AlertService

async def main():
    db = SessionLocal()
    service = ArbitrageService()
    alerts = AlertService()
    
    # Récupérer les ventes
    await service.fetch_and_store_sales(
        db=db,
        search_query="Pokemon Charizard PSA 10",
        psa_grade="PSA 10"
    )
    
    # Récupérer les listings
    await service.fetch_and_store_listings(
        db=db,
        search_query="Pokemon Charizard PSA 10",
        psa_grade="PSA 10"
    )
    
    # Détecter les opportunités
    opportunities = service.detect_opportunities(db)
    
    # Envoyer les alertes
    if opportunities:
        await alerts.send_batch_alerts(opportunities)
    
    db.close()

asyncio.run(main())
```

## Exemples de requêtes eBay API

### Recherche de ventes complétées (Finding API)

```
GET https://svcs.ebay.com/services/search/FindingService/v1
?OPERATION-NAME=findCompletedItems
&SERVICE-VERSION=1.0.0
&SECURITY-APPNAME=YOUR_APP_ID
&RESPONSE-DATA-FORMAT=JSON
&keywords=Pokemon Charizard PSA 10
&itemFilter(0).name=SoldItemsOnly
&itemFilter(0).value=true
&itemFilter(1).name=ListingType
&itemFilter(1).value=FixedPrice
&paginationInput.entriesPerPage=100
```

### Recherche de listings actifs (Finding API)

```
GET https://svcs.ebay.com/services/search/FindingService/v1
?OPERATION-NAME=findItemsAdvanced
&SERVICE-VERSION=1.0.0
&SECURITY-APPNAME=YOUR_APP_ID
&RESPONSE-DATA-FORMAT=JSON
&keywords=Pokemon Charizard PSA 10
&itemFilter(0).name=ListingType
&itemFilter(0).value=FixedPrice
&paginationInput.entriesPerPage=100
```

## Notes importantes

1. **Limites de taux eBay**: L'API eBay a des limites de taux. Respectez-les pour éviter les erreurs 429.

2. **Données de test**: Pour tester sans clés API réelles, vous pouvez créer des données mock dans la base de données.

3. **Normalisation des cartes**: Le système normalise automatiquement les noms de cartes, mais pour de meilleurs résultats, utilisez OpenAI API (optionnel).

4. **Calcul du prix plancher**: Le système nécessite au moins 5 ventes comparables pour calculer un prix plancher fiable.

