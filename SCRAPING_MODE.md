# 🕷️ Mode Scraping - Configuration Sans Clés API

## ✅ Configuration Actuelle

Le système est maintenant configuré pour utiliser le **scraping par défaut** si vous n'avez pas de clés API eBay.

### Changements Effectués

1. **Configuration** : `use_scraping_mode = True` par défaut
2. **Service eBay** : Utilise automatiquement le scraper si pas de clés API
3. **Scraper amélioré** : Meilleure extraction des données
4. **Dépendances** : `beautifulsoup4`, `lxml`, `python-dateutil` ajoutées

## 🚀 Utilisation

### Le système fonctionne automatiquement

Aucune configuration supplémentaire nécessaire ! Le système détecte automatiquement :
- Si vous avez des clés API → utilise l'API officielle
- Si vous n'avez pas de clés API → utilise le scraping

### Exemple d'utilisation

```python
from app.services.arbitrage_service import ArbitrageService
from app.core.database import SessionLocal

db = SessionLocal()
service = ArbitrageService()

# Récupérer les ventes (utilise le scraping automatiquement)
await service.fetch_and_store_sales(
    db=db,
    search_query="Pokemon Charizard PSA 10",
    psa_grade="PSA 10",
    days_back=30
)

# Récupérer les listings actifs (utilise le scraping automatiquement)
await service.fetch_and_store_listings(
    db=db,
    search_query="Pokemon Charizard PSA 10",
    psa_grade="PSA 10"
)
```

### Via l'API

```bash
# Récupérer les ventes (scraping automatique)
curl -X POST "http://localhost:8000/api/fetch-sales?search_query=Pokemon%20Charizard%20PSA%2010"

# Récupérer les listings (scraping automatique)
curl -X POST "http://localhost:8000/api/fetch-listings?search_query=Pokemon%20Charizard%20PSA%2010"

# Détecter les opportunités
curl -X POST "http://localhost:8000/api/detect-opportunities"
```

## ⚙️ Configuration

### Variables d'Environnement (Optionnel)

Dans `.env` :

```env
# Mode scraping (par défaut True si pas de clés API)
USE_SCRAPING_MODE=true

# Délai entre requêtes (secondes)
SCRAPING_DELAY=2.0

# Limite de requêtes par heure
SCRAPING_MAX_REQUESTS_PER_HOUR=100
```

### Désactiver le Scraping

Si vous obtenez des clés API plus tard :

```env
USE_SCRAPING_MODE=false
EBAY_APP_ID=votre_clé
EBAY_CLIENT_ID=votre_id
EBAY_CLIENT_SECRET=votre_secret
```

## 🎯 Fonctionnalités du Scraper

### ✅ Ce qui fonctionne

- ✅ Recherche de ventes complétées
- ✅ Recherche de listings actifs
- ✅ Extraction des prix
- ✅ Extraction des dates de vente
- ✅ Extraction des images
- ✅ Extraction des conditions
- ✅ Extraction du shipping
- ✅ Rate limiting automatique
- ✅ Gestion d'erreurs

### ⚠️ Limitations

- ⚠️ Rate limiting : 2 secondes entre requêtes (configurable)
- ⚠️ Peut être bloqué par eBay si trop de requêtes
- ⚠️ Moins fiable que l'API officielle
- ⚠️ Structure HTML d'eBay peut changer

## 🛡️ Protections Intégrées

### Rate Limiting

- **Délai par défaut** : 2 secondes entre chaque requête
- **Configurable** : Via `SCRAPING_DELAY` dans `.env`
- **Respecte les limites** : Pour éviter les blocages

### Headers Réalistes

Le scraper utilise des headers de navigateur réel pour éviter la détection :
- User-Agent Chrome
- Accept-Language
- Accept-Encoding
- Connection keep-alive

### Gestion d'Erreurs

- Retry automatique en cas d'erreur
- Logging détaillé des erreurs
- Fallback gracieux si le scraping échoue

## 📊 Performance

### Vitesse

- **~2 secondes par requête** (avec rate limiting)
- **~50 résultats par requête** (configurable)
- **Pour 100 résultats** : ~4 secondes

### Limites Recommandées

- **Maximum 100 requêtes/heure** (par défaut)
- **Maximum 50 résultats par requête** (pour éviter les timeouts)
- **Utiliser des délais** entre les batchs de requêtes

## 🐛 Dépannage

### Le scraper ne trouve pas de résultats

1. **Vérifier la requête** : La recherche doit être précise
2. **Vérifier les logs** : Regarder les erreurs dans les logs
3. **Tester manuellement** : Vérifier que la recherche fonctionne sur eBay.com
4. **Structure HTML changée** : eBay peut avoir changé la structure

### Erreur "Rate limited" ou CAPTCHA

1. **Augmenter le délai** : Mettre `SCRAPING_DELAY=5.0` dans `.env`
2. **Réduire les requêtes** : Moins de résultats par requête
3. **Attendre** : Laisser passer du temps entre les batchs
4. **Utiliser un proxy** : Pour éviter les blocages IP

### Erreur "Module not found"

Installer les dépendances :

```bash
pip install beautifulsoup4 lxml python-dateutil
```

Ou :

```bash
pip install -r requirements.txt
```

## 🔄 Migration Vers l'API Officielle

Quand vous obtiendrez des clés API eBay :

1. **Obtenir les clés** : https://developer.ebay.com/
2. **Configurer** :
   ```env
   USE_SCRAPING_MODE=false
   EBAY_APP_ID=votre_clé
   EBAY_CLIENT_ID=votre_id
   EBAY_CLIENT_SECRET=votre_secret
   ```
3. **Redémarrer** : Le système utilisera automatiquement l'API

## 📝 Notes Importantes

### ⚠️ Avertissements

- Le scraping peut violer les ToS d'eBay
- Utilisez avec modération
- Respectez les limites de taux
- Considérez obtenir des clés API pour un usage production

### ✅ Bonnes Pratiques

- Utilisez des délais entre requêtes
- Limitez le nombre de requêtes par heure
- Surveillez les logs pour détecter les problèmes
- Migrez vers l'API officielle dès que possible

## 🎯 Déploiement sur Render

Le scraping fonctionne aussi sur Render ! Assurez-vous que :

1. **Dépendances installées** : `beautifulsoup4`, `lxml`, `python-dateutil` dans `requirements.txt` ✅
2. **Pas besoin de clés API** : Le système utilisera le scraping automatiquement ✅
3. **Variables d'environnement** : Optionnel, le scraping fonctionne sans config ✅

## ✅ Conclusion

Le système est maintenant **100% fonctionnel sans clés API** grâce au scraping intégré. Vous pouvez :

- ✅ Démarrer immédiatement
- ✅ Récupérer les ventes complétées
- ✅ Récupérer les listings actifs
- ✅ Détecter les opportunités d'arbitrage
- ✅ Déployer sur Render sans configuration supplémentaire

Le scraping est utilisé automatiquement et transparent pour vous !

