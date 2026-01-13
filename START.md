# Guide de Démarrage Local

## ✅ Commit effectué

Le code a été commité avec succès :
```
feat: Ajout MVP bot arbitrage eBay avec interface web Magic Eden-style
```

## 🚀 Démarrage des Services

### 1. Backend FastAPI

**Option A: Avec venv (recommandé)**
```bash
cd /Users/valentin/EbayScalping
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option B: Sans venv**
```bash
cd /Users/valentin/EbayScalping
pip3 install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera disponible sur : **http://localhost:8000**
- API Docs : http://localhost:8000/docs
- Health check : http://localhost:8000/health

### 2. Frontend Next.js

**Prérequis**: Node.js et npm doivent être installés

```bash
cd /Users/valentin/EbayScalping/web
npm install
npm run dev
```

Le frontend sera disponible sur : **http://localhost:3000**

## 📝 Configuration

### Backend (.env)

Créer un fichier `.env` à la racine avec :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ebay_arbitrage
EBAY_APP_ID=your_ebay_app_id
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
```

### Frontend (.env.local)

Créer un fichier `web/.env.local` :

```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

## 🗄️ Base de Données

Si PostgreSQL n'est pas configuré, créer la base :

```bash
createdb ebay_arbitrage
```

Puis exécuter les migrations :

```bash
cd /Users/valentin/EbayScalping
source venv/bin/activate
alembic upgrade head
```

## 🔧 Dépannage

### Backend ne démarre pas
- Vérifier que Python 3.8+ est installé
- Vérifier que toutes les dépendances sont installées
- Vérifier que le fichier `.env` existe avec les bonnes valeurs

### Frontend ne démarre pas
- Vérifier que Node.js 18+ est installé : `node --version`
- Vérifier que npm est installé : `npm --version`
- Installer Node.js depuis https://nodejs.org/ si nécessaire

### Erreurs de connexion entre frontend et backend
- Vérifier que le backend est démarré sur le port 8000
- Vérifier la variable `NEXT_PUBLIC_FASTAPI_URL` dans `web/.env.local`
- Vérifier les logs du navigateur (F12) pour les erreurs CORS

## 📦 Push vers Git

Pour pousser vers un dépôt distant :

```bash
# Ajouter le remote (remplacer par votre URL)
git remote add origin https://github.com/votre-username/EbayScalping.git

# Push
git push -u origin main
```

## 🎯 Utilisation

1. Démarrer le backend FastAPI
2. Démarrer le frontend Next.js
3. Ouvrir http://localhost:3000 dans le navigateur
4. L'interface utilisera les données mock si le backend n'est pas configuré avec les vraies clés eBay

