# 🚀 Guide de Démarrage - Résolution des Problèmes

## ✅ Problème Résolu

Le backend ne démarrait pas car le fichier `.env` était manquant. J'ai ajouté des **valeurs par défaut** pour permettre le démarrage sans configuration.

## 🎯 Démarrage Rapide

### Backend FastAPI

```bash
cd /Users/valentin/EbayScalping

# Activer l'environnement virtuel
source venv/bin/activate

# Démarrer le serveur
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Le backend sera disponible sur : **http://localhost:8000**
- API Docs : http://localhost:8000/docs
- Health check : http://localhost:8000/health

### Frontend Next.js

**Prérequis : Node.js doit être installé**

```bash
cd /Users/valentin/EbayScalping/web

# Installer les dépendances (première fois)
npm install

# Démarrer le serveur
npm run dev
```

Le frontend sera disponible sur : **http://localhost:3000**

## 📝 Configuration (Optionnel)

### Créer un fichier `.env` pour personnaliser

Créez un fichier `.env` à la racine avec :

```env
# Database - SQLite par défaut (fonctionne sans PostgreSQL)
DATABASE_URL=sqlite:///./ebay_arbitrage.db

# Pour utiliser PostgreSQL (si installé)
# DATABASE_URL=postgresql://user:password@localhost:5432/ebay_arbitrage

# eBay API (remplacer par vos vraies clés)
EBAY_APP_ID=your_ebay_app_id
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret

# Configuration
SHIPPING_COST=5.0
ARBITRAGE_THRESHOLD=0.8
MIN_SALES_FOR_FLOOR=5
MAX_SALES_FOR_FLOOR=10
```

**Note** : Le backend fonctionne maintenant **sans fichier .env** grâce aux valeurs par défaut.

## 🔍 Vérification

### Tester le backend

```bash
# Health check
curl http://localhost:8000/health

# API root
curl http://localhost:8000/

# Endpoints disponibles
curl http://localhost:8000/api/opportunities
```

### Tester le frontend

1. Ouvrir http://localhost:3000 dans le navigateur
2. L'interface devrait s'afficher avec des données mock
3. Les filtres et la recherche devraient fonctionner

## 🐛 Problèmes Courants

### Backend ne démarre pas

**Erreur : "Field required"**
- ✅ **Résolu** : Les valeurs par défaut sont maintenant configurées
- Si le problème persiste, créer un fichier `.env` avec les valeurs minimales

**Erreur : "Port 8000 already in use"**
```bash
# Tuer le processus sur le port 8000
lsof -ti:8000 | xargs kill -9

# Ou utiliser un autre port
uvicorn app.main:app --reload --port 8001
```

**Erreur de base de données**
- SQLite est utilisé par défaut (pas besoin de PostgreSQL)
- La base sera créée automatiquement au premier démarrage
- Vérifier les permissions d'écriture dans le dossier

### Frontend ne démarre pas

**Erreur : "command not found: npm"**
- Node.js n'est pas installé
- Installer avec : `brew install node`

**Erreur : "Port 3000 already in use"**
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

**Erreur de connexion au backend**
- Vérifier que le backend est démarré sur le port 8000
- Vérifier `web/.env.local` : `NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000`
- Le frontend utilisera des données mock si le backend n'est pas disponible

## 📊 Base de Données

### SQLite (Par défaut - Fonctionne immédiatement)

La base de données SQLite sera créée automatiquement dans `ebay_arbitrage.db` au premier démarrage.

Pour réinitialiser :
```bash
rm ebay_arbitrage.db
# Redémarrer le backend
```

### PostgreSQL (Optionnel)

Si vous voulez utiliser PostgreSQL :

1. Installer PostgreSQL
2. Créer la base :
```bash
createdb ebay_arbitrage
```

3. Modifier `.env` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ebay_arbitrage
```

4. Exécuter les migrations :
```bash
alembic upgrade head
```

## 🎯 Commandes Utiles

### Démarrer les deux services

**Terminal 1 - Backend :**
```bash
cd /Users/valentin/EbayScalping
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend :**
```bash
cd /Users/valentin/EbayScalping/web
npm run dev
```

### Vérifier les processus

```bash
# Vérifier le backend
lsof -ti:8000 && echo "Backend actif" || echo "Backend inactif"

# Vérifier le frontend
lsof -ti:3000 && echo "Frontend actif" || echo "Frontend inactif"
```

### Arrêter les services

```bash
# Arrêter le backend
lsof -ti:8000 | xargs kill -9

# Arrêter le frontend
lsof -ti:3000 | xargs kill -9
```

## ✅ État Actuel

- ✅ Backend démarre correctement avec valeurs par défaut
- ✅ Base de données SQLite configurée automatiquement
- ✅ API accessible sur http://localhost:8000
- ⚠️ Frontend nécessite Node.js (voir `web/INSTALL.md`)

## 📚 Documentation

- `README.md` - Documentation principale
- `EXAMPLES.md` - Exemples d'utilisation API
- `ARCHITECTURE.md` - Architecture du système
- `INTEGRATION.md` - Intégration frontend/backend
- `web/INSTALL.md` - Installation du frontend
- `web/QUICK_START.md` - Démarrage rapide frontend

