# 🕷️ Mode Scraping - Guide Complet

## ✅ Configuration Actuelle

Le système est maintenant configuré pour utiliser le **scraping par défaut** car vous n'avez pas de clés API eBay.

## 🚀 Installation

### Installer les Dépendances

```bash
pip install beautifulsoup4 lxml python-dateutil
```

Ou :

```bash
pip install -r requirements.txt
```

## 🎯 Utilisation Automatique

Le système détecte automatiquement :
- ✅ **Pas de clés API** → Utilise le scraping
- ✅ **Clés API présentes** → Utilise l'API officielle

**Aucune configuration supplémentaire nécessaire !**

## 📝 Exemples

### Via l'API

```bash
# Récupérer les ventes (scraping automatique)
curl -X POST "http://localhost:8000/api/fetch-sales?search_query=Pokemon%20Charizard%20PSA%2010&psa_grade=PSA%2010"

# Récupérer les listings actifs (scraping automatique)
curl -X POST "http://localhost:8000/api/fetch-listings?search_query=Pokemon%20Charizard%20PSA%2010"

# Détecter les opportunités
curl -X POST "http://localhost:8000/api/detect-opportunities"
```

### Via Python

```python
from app.services.arbitrage_service import ArbitrageService
from app.core.database import SessionLocal

db = SessionLocal()
service = ArbitrageService()

# Le scraping est utilisé automatiquement
await service.fetch_and_store_sales(
    db=db,
    search_query="Pokemon Charizard PSA 10",
    psa_grade="PSA 10"
)
```

## ⚙️ Configuration (Optionnel)

Dans `.env` :

```env
# Mode scraping (True par défaut si pas de clés API)
USE_SCRAPING_MODE=true

# Délai entre requêtes (secondes)
SCRAPING_DELAY=2.0

# Limite de requêtes par heure
SCRAPING_MAX_REQUESTS_PER_HOUR=100
```

## 🎯 Déploiement sur Render

Le scraping fonctionne aussi sur Render ! 

1. **Dépendances** : Déjà dans `requirements.txt` ✅
2. **Configuration** : Aucune nécessaire ✅
3. **Variables d'environnement** : Optionnelles ✅

Le système utilisera automatiquement le scraping sur Render.

## ⚠️ Limitations

- Rate limiting : 2 secondes entre requêtes
- Peut être bloqué par eBay si trop de requêtes
- Moins fiable que l'API officielle
- Structure HTML d'eBay peut changer

## 📊 Performance

- ~2 secondes par requête
- ~50 résultats par requête
- Pour 100 résultats : ~4 secondes

## 🔄 Migration Future

Quand vous obtiendrez des clés API :

```env
USE_SCRAPING_MODE=false
EBAY_APP_ID=votre_clé
EBAY_CLIENT_ID=votre_id
EBAY_CLIENT_SECRET=votre_secret
```

Le système basculera automatiquement vers l'API officielle.

## ✅ Tout est Prêt !

Vous pouvez maintenant :
- ✅ Démarrer le backend
- ✅ Utiliser toutes les fonctionnalités
- ✅ Déployer sur Render
- ✅ Tout fonctionne sans clés API !

