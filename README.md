# eBay Arbitrage Bot - MVP

Bot d'arbitrage pour cartes à collectionner (Pokémon PSA) utilisant les APIs eBay.

## Fonctionnalités

- Récupération des ventes complétées (30 derniers jours)
- Normalisation des noms de cartes
- Calcul du prix plancher basé sur les ventes récentes
- Détection d'opportunités d'arbitrage
- Estimation du profit net après frais eBay et shipping
- Stockage PostgreSQL
- Alertes console (prêt pour Telegram)

## Installation

1. Installer les dépendances:
```bash
pip install -r requirements.txt
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. Créer la base de données PostgreSQL:
```bash
createdb ebay_arbitrage
```

4. Initialiser les migrations Alembic:
```bash
alembic upgrade head
```

## Utilisation

Démarrer le serveur FastAPI:
```bash
uvicorn app.main:app --reload
```

## Structure du projet

- `app/` - Code principal de l'application
  - `models/` - Modèles SQLAlchemy
  - `schemas/` - Schémas Pydantic
  - `services/` - Services métier (eBay API, calculs)
  - `api/` - Endpoints FastAPI
  - `core/` - Configuration et utilitaires
- `alembic/` - Migrations de base de données

