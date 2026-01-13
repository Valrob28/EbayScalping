# 🕷️ Scraping eBay - Guide et Avertissements

## ⚠️ AVERTISSEMENTS IMPORTANTS

### Limitations Légales

1. **Conditions d'Utilisation eBay** : Le scraping peut violer les ToS d'eBay
2. **Protections Anti-Scraping** : eBay utilise des CAPTCHAs, rate limiting, et IP blocking
3. **Risques Légaux** : Possible violation de copyright et de la loi sur le scraping
4. **Recommandation** : **Utilisez les APIs officielles eBay en priorité**

### APIs Officielles eBay (Recommandé)

eBay fournit des APIs officielles :
- **Finding API** : Pour rechercher des items et ventes complétées
- **Browse API** : Pour les détails des listings
- **Trading API** : Pour les opérations avancées

**Avantages** :
- ✅ Légales et autorisées
- ✅ Données structurées et fiables
- ✅ Pas de risque de blocage
- ✅ Support officiel

## 🛠️ Service de Scraping Créé

J'ai créé `app/services/ebay_scraper.py` avec :

### Fonctionnalités

1. **Scraping des ventes complétées**
   - Recherche dans les résultats eBay
   - Extraction des prix, dates, conditions
   - Rate limiting intégré

2. **Scraping des détails de listing**
   - Informations complètes d'un item
   - Images, description, seller info
   - Shipping details

3. **Protections intégrées**
   - Délai entre requêtes (2 secondes)
   - User-Agent réaliste
   - Gestion d'erreurs

### Utilisation

```python
from app.services.ebay_scraper import eBayScraper

scraper = eBayScraper()

# Scraper les ventes complétées
sales = await scraper.scrape_completed_listings(
    search_query="Pokemon Charizard PSA 10",
    max_results=50,
    days_back=30
)

# Scraper les détails d'un listing
details = await scraper.scrape_listing_details("123456789")
```

## 🔧 Intégration avec le Service Existant

### Option 1 : Utiliser le Scraper comme Fallback

Modifier `app/services/ebay_service.py` :

```python
from app.services.ebay_scraper import eBayScraper

class eBayService:
    def __init__(self):
        self.scraper = eBayScraper()  # Fallback si API échoue
    
    async def search_completed_sales(self, ...):
        # Essayer d'abord avec l'API officielle
        try:
            return await self._api_search(...)
        except Exception as e:
            logger.warning(f"API échouée, utilisation du scraper: {e}")
            # Fallback sur scraping (avec précaution)
            return await self.scraper.scrape_completed_listings(...)
```

### Option 2 : Endpoint API Dédié

Ajouter dans `app/api/routes.py` :

```python
from app.services.ebay_scraper import eBayScraper

@router.post("/scrape-sales")
async def scrape_sales(
    search_query: str,
    max_results: int = 50,
    use_scraper: bool = False  # Option pour forcer le scraping
):
    """
    ⚠️ Endpoint de scraping - Utilisez avec précaution
    """
    if not use_scraper:
        # Utiliser l'API officielle par défaut
        return await arbitrage_service.fetch_and_store_sales(...)
    
    scraper = eBayScraper()
    results = await scraper.scrape_completed_listings(
        search_query=search_query,
        max_results=max_results
    )
    return results
```

## 🚫 Alternatives Légales au Scraping

### 1. Services de Scraping Tiers (Payants mais Légaux)

- **ScraperAPI** : https://www.scraperapi.com/
  - Gère les proxies, CAPTCHAs, rotation IP
  - ~$49/mois pour 100k requêtes

- **Bright Data** : https://brightdata.com/
  - Réseau de proxies résidentiels
  - Plus cher mais très fiable

- **Apify eBay Scraper** : https://apify.com/
  - Scrapers pré-construits pour eBay
  - Pay-as-you-go

### 2. Améliorer l'Utilisation des APIs eBay

#### Augmenter les Limites

1. **Upgrade votre compte eBay Developer**
   - Free tier : 5,000 calls/day
   - Paid tier : Plus de limites

2. **Optimiser les Requêtes**
   - Utiliser des filtres précis
   - Paginer efficacement
   - Mettre en cache les résultats

#### Utiliser Plusieurs APIs

```python
# Combiner Finding API + Browse API
# Finding pour la recherche
# Browse pour les détails complets
```

## 📋 Bonnes Pratiques si vous Scrapez

### 1. Respecter robots.txt

```bash
curl https://www.ebay.com/robots.txt
```

### 2. Rate Limiting Strict

- Minimum 2-3 secondes entre requêtes
- Maximum 100 requêtes/heure par IP
- Utiliser des proxies rotatifs

### 3. Headers Réalistes

```python
headers = {
    "User-Agent": "Mozilla/5.0...",  # Navigateur réel
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.ebay.com/",
}
```

### 4. Gestion d'Erreurs

- Détecter les CAPTCHAs
- Gérer les blocages IP
- Retry avec backoff exponentiel

### 5. Respecter les Données

- Ne pas surcharger les serveurs
- Ne pas stocker de données personnelles
- Respecter le copyright

## 🎯 Recommandation Finale

### Pour ce Projet

1. **Priorité 1** : Utiliser les APIs eBay officielles
   - Déjà implémenté dans `ebay_service.py`
   - Fonctionne bien pour la plupart des cas

2. **Priorité 2** : Améliorer l'utilisation des APIs
   - Ajouter plus de filtres
   - Optimiser les requêtes
   - Mettre en cache

3. **Dernier Recours** : Scraping
   - Utiliser uniquement si l'API ne fournit pas les données
   - Avec rate limiting strict
   - Considérer un service tiers légal

## 📝 Configuration

### Ajouter au .env (optionnel)

```env
# Pour utiliser ScraperAPI (service tiers)
SCRAPERAPI_KEY=your_scraperapi_key

# Configuration scraping
SCRAPING_ENABLED=false
SCRAPING_DELAY=2.0
SCRAPING_MAX_REQUESTS_PER_HOUR=100
```

## ⚖️ Aspects Légaux

### Ce qui est Généralement Acceptable

- ✅ Scraping de données publiques
- ✅ Usage personnel/éducatif
- ✅ Respect du robots.txt
- ✅ Rate limiting raisonnable

### Ce qui est Problématique

- ❌ Violation des ToS explicites
- ❌ Scraping à grande échelle
- ❌ Bypass des protections (CAPTCHA, etc.)
- ❌ Usage commercial sans autorisation

### Recommandation Légale

**Consultez un avocat** avant d'utiliser le scraping à des fins commerciales.

## 🔍 Détection de Scraping par eBay

eBay peut détecter le scraping via :

1. **Patterns de Requêtes**
   - Trop de requêtes depuis une IP
   - Pas de cookies de session
   - Headers suspects

2. **Comportement**
   - Pas de clics réels
   - Navigation non humaine
   - Pas de JavaScript exécuté

3. **Techniques Anti-Bot**
   - CAPTCHA
   - Rate limiting
   - IP blocking
   - Fingerprinting

## ✅ Conclusion

Le scraping est possible mais **non recommandé**. Utilisez les APIs officielles eBay qui sont :
- Plus fiables
- Plus rapides
- Légales
- Supportées

Le service de scraping est fourni comme **fallback** uniquement, avec tous les avertissements nécessaires.

