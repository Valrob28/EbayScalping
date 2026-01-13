# Architecture du Bot d'Arbitrage eBay

## Vue d'ensemble

Le bot d'arbitrage est construit avec une architecture modulaire en Python utilisant FastAPI, SQLAlchemy et PostgreSQL.

## Structure du projet

```
EbayScalping/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # Endpoints REST API
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration (Pydantic Settings)
│   │   └── database.py         # Configuration SQLAlchemy
│   ├── models/
│   │   ├── __init__.py
│   │   ├── card.py             # Modèle Card
│   │   ├── sale.py             # Modèle Sale
│   │   ├── listing.py          # Modèle Listing
│   │   └── opportunity.py      # Modèle Opportunity
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── card.py             # Schémas Pydantic pour Card
│   │   ├── sale.py             # Schémas Pydantic pour Sale
│   │   ├── listing.py          # Schémas Pydantic pour Listing
│   │   └── opportunity.py      # Schémas Pydantic pour Opportunity
│   └── services/
│       ├── __init__.py
│       ├── ebay_service.py     # Intégration eBay API
│       ├── card_normalizer.py  # Normalisation des noms de cartes
│       ├── floor_price_calculator.py  # Calcul du prix plancher
│       ├── arbitrage_service.py      # Service principal d'arbitrage
│       └── alert_service.py          # Système d'alertes
├── alembic/
│   ├── env.py                  # Configuration Alembic
│   ├── script.py.mako          # Template de migration
│   └── versions/
│       ├── __init__.py
│       └── 001_initial_migration.py
├── scripts/
│   ├── __init__.py
│   └── example_usage.py        # Exemple d'utilisation
├── requirements.txt
├── alembic.ini
├── README.md
├── EXAMPLES.md
└── ARCHITECTURE.md

```

## Flux de données

### 1. Récupération des ventes complétées

```
eBay Finding API → eBayService.search_completed_sales()
  → ArbitrageService.fetch_and_store_sales()
    → Normalisation (CardNormalizer)
    → Stockage en DB (Card, Sale)
```

### 2. Récupération des listings actifs

```
eBay Finding API → eBayService.search_active_listings()
  → ArbitrageService.fetch_and_store_listings()
    → Normalisation (CardNormalizer)
    → Stockage en DB (Card, Listing)
```

### 3. Détection d'opportunités

```
ArbitrageService.detect_opportunities()
  → Récupération des listings actifs
  → Récupération des ventes pour chaque carte
  → Calcul du prix plancher (FloorPriceCalculator)
  → Comparaison: listing_price < threshold * floor_price
  → Calcul du profit estimé
  → Création d'Opportunity en DB
```

### 4. Envoi d'alertes

```
AlertService.send_opportunity_alert()
  → Formatage du message
  → Affichage console
  → Envoi Telegram (si configuré)
```

## Modèles de données

### Card
- Représente une carte normalisée
- Clé unique: `normalized_name` + `language`
- Relations: Sales, Listings, Opportunities

### Sale
- Représente une vente complétée sur eBay
- Clé unique: `ebay_item_id`
- Contient: prix, date de vente, grade PSA, condition

### Listing
- Représente un listing actif sur eBay
- Clé unique: `ebay_item_id`
- Contient: prix actuel, URL, statut actif/inactif

### Opportunity
- Représente une opportunité d'arbitrage détectée
- Contient: prix listing, prix plancher, profit estimé, marge
- Statut: actif/inactif, alerté/non alerté

## Services principaux

### eBayService
- Intégration avec l'API eBay Finding
- Parsing des réponses JSON
- Extraction des métadonnées (PSA grade, langue)

### CardNormalizer
- Normalisation des noms de cartes depuis les titres eBay
- Support basique (regex) et avancé (OpenAI GPT)
- Extraction du set, numéro de carte

### FloorPriceCalculator
- Calcul du prix plancher basé sur les ventes récentes
- Suppression des outliers (méthode IQR)
- Médiane pondérée par la date (ventes récentes = plus de poids)
- Filtrage par grade PSA et langue

### ArbitrageService
- Orchestration des opérations principales
- Récupération et stockage des données eBay
- Détection d'opportunités
- Calcul des profits (frais eBay, shipping)

### AlertService
- Formatage et envoi d'alertes
- Support console (toujours)
- Support Telegram (optionnel)

## Configuration

Toutes les configurations sont dans `.env` et chargées via Pydantic Settings:

- **Database**: URL PostgreSQL
- **eBay API**: App ID, Client ID, Secret
- **OpenAI**: API Key (optionnel)
- **Telegram**: Bot Token, Chat ID (optionnel)
- **Business Logic**: Shipping cost, arbitrage threshold, min/max sales pour floor

## API Endpoints

### GET /api/cards
Liste des cartes enregistrées

### GET /api/cards/{card_id}
Détails d'une carte

### GET /api/cards/{card_id}/sales
Ventes d'une carte

### GET /api/sales
Toutes les ventes

### GET /api/listings
Listings actifs

### GET /api/opportunities
Opportunités d'arbitrage (avec filtres)

### POST /api/fetch-sales
Récupère les ventes depuis eBay

### POST /api/fetch-listings
Récupère les listings depuis eBay

### POST /api/detect-opportunities
Détecte les opportunités

### POST /api/run-full-scan
Exécute un scan complet (ventes + listings + détection + alertes)

## Points d'attention

1. **Limites de taux eBay**: Respecter les limites de l'API eBay
2. **Normalisation**: La qualité de la normalisation impacte la détection
3. **Prix plancher**: Nécessite au moins 5 ventes comparables
4. **Frais eBay**: Configurés à 13% par défaut (ajustable)
5. **Outliers**: Supprimés automatiquement mais peuvent affecter le calcul si trop nombreux

## Améliorations futures possibles

1. Cache Redis pour les requêtes eBay fréquentes
2. Webhooks pour notifications en temps réel
3. Dashboard web pour visualisation
4. Machine Learning pour améliorer la normalisation
5. Support multi-marchés (pas seulement eBay)
6. Backtesting sur données historiques

