# 🚀 Guide de Déploiement

## Architecture Recommandée

- **Backend (FastAPI)** → **Render** (meilleur pour Python + PostgreSQL)
- **Frontend (Next.js)** → **Vercel** (optimal pour Next.js)

## Option 1 : Render (Backend) + Vercel (Frontend) ⭐ Recommandé

### Partie 1 : Déployer le Backend sur Render

#### 1. Préparer le projet

Créer `render.yaml` à la racine :

```yaml
services:
  - type: web
    name: ebay-arbitrage-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ebay-arbitrage-db
          property: connectionString
      - key: EBAY_APP_ID
        sync: false
      - key: EBAY_CLIENT_ID
        sync: false
      - key: EBAY_CLIENT_SECRET
        sync: false
      - key: PYTHON_VERSION
        value: 3.9.18

databases:
  - name: ebay-arbitrage-db
    databaseName: ebay_arbitrage
    user: ebay_user
    plan: free
```

#### 2. Créer un fichier `runtime.txt` (optionnel)

```
python-3.9.18
```

#### 3. Créer un fichier `Procfile` (alternative à render.yaml)

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### 4. Étapes sur Render

1. Aller sur https://render.com
2. Créer un compte (gratuit)
3. Cliquer sur "New +" → "Web Service"
4. Connecter votre repository GitHub
5. Configurer :
   - **Name** : `ebay-arbitrage-api`
   - **Environment** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Ajouter les variables d'environnement :
   - `DATABASE_URL` : Sera automatiquement rempli si vous créez une base PostgreSQL
   - `EBAY_APP_ID` : Votre clé eBay
   - `EBAY_CLIENT_ID` : Votre client ID eBay
   - `EBAY_CLIENT_SECRET` : Votre secret eBay
   - `PYTHON_VERSION` : `3.9.18`
7. Créer une base PostgreSQL :
   - "New +" → "PostgreSQL"
   - Nom : `ebay-arbitrage-db`
   - Plan : Free
   - Connecter au service web
8. Déployer !

#### 5. Exécuter les migrations

Une fois déployé, exécuter les migrations via le shell Render :

```bash
# Dans le shell Render
alembic upgrade head
```

Ou créer un script de build qui exécute les migrations :

```bash
# Dans render.yaml ou build command
pip install -r requirements.txt && alembic upgrade head
```

### Partie 2 : Déployer le Frontend sur Vercel

#### 1. Préparer le projet

Le frontend Next.js est déjà prêt pour Vercel !

#### 2. Créer `vercel.json` (optionnel)

```json
{
  "buildCommand": "cd web && npm install && npm run build",
  "outputDirectory": "web/.next",
  "devCommand": "cd web && npm run dev",
  "installCommand": "cd web && npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://votre-api.render.com/api/$1"
    }
  ]
}
```

#### 3. Modifier `web/.env.production` ou variables Vercel

Créer `web/.env.production` :

```env
NEXT_PUBLIC_FASTAPI_URL=https://votre-api.render.com
```

#### 4. Étapes sur Vercel

1. Aller sur https://vercel.com
2. Créer un compte (gratuit avec GitHub)
3. Cliquer sur "Add New Project"
4. Importer votre repository GitHub
5. Configurer :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `web`
   - **Build Command** : `npm run build` (déjà configuré)
   - **Output Directory** : `.next` (déjà configuré)
6. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_FASTAPI_URL` : `https://votre-api.render.com`
7. Déployer !

#### 5. Mettre à jour le frontend

Dans `web/app/api/opportunities/route.ts`, mettre à jour l'URL par défaut :

```typescript
const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
```

## Option 2 : Tout sur Render

### Backend + Frontend sur Render

#### Backend (comme ci-dessus)

#### Frontend sur Render

1. Créer un nouveau "Web Service"
2. Configurer :
   - **Environment** : `Node`
   - **Root Directory** : `web`
   - **Build Command** : `cd web && npm install && npm run build`
   - **Start Command** : `cd web && npm start`
3. Variables d'environnement :
   - `NEXT_PUBLIC_FASTAPI_URL` : URL de votre backend Render

## Option 3 : Railway (Alternative)

Railway supporte aussi Python et Next.js très bien.

### Backend sur Railway

1. Aller sur https://railway.app
2. Créer un projet
3. "New" → "GitHub Repo"
4. Sélectionner votre repo
5. Railway détecte automatiquement Python
6. Ajouter une base PostgreSQL
7. Variables d'environnement dans "Variables"
8. Déployer !

### Frontend sur Railway

1. "New" → "GitHub Repo"
2. Sélectionner le même repo
3. Railway détecte Next.js
4. Configurer le "Root Directory" : `web`
5. Variables d'environnement
6. Déployer !

## 🔧 Configuration CORS

Pour que le frontend puisse communiquer avec le backend, ajouter CORS dans `app/main.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://votre-frontend.vercel.app",
        # Ajouter d'autres origines si nécessaire
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Ou pour accepter toutes les origines (développement uniquement) :

```python
allow_origins=["*"]
```

## 📝 Checklist de Déploiement

### Backend
- [ ] Repository GitHub créé et poussé
- [ ] Fichier `requirements.txt` présent
- [ ] Variables d'environnement configurées sur Render/Railway
- [ ] Base de données PostgreSQL créée
- [ ] Migrations Alembic exécutées
- [ ] CORS configuré pour accepter le frontend
- [ ] Test de l'API : `curl https://votre-api.render.com/health`

### Frontend
- [ ] Repository GitHub avec dossier `web/`
- [ ] `package.json` présent dans `web/`
- [ ] Variable `NEXT_PUBLIC_FASTAPI_URL` configurée sur Vercel
- [ ] Build réussi sur Vercel
- [ ] Test de l'interface : Ouvrir l'URL Vercel

## 🐛 Dépannage

### Backend ne démarre pas sur Render

- Vérifier les logs dans Render Dashboard
- Vérifier que `requirements.txt` contient toutes les dépendances
- Vérifier que le `startCommand` utilise `$PORT` (variable Render)
- Vérifier les variables d'environnement

### Frontend ne peut pas accéder au backend

- Vérifier CORS dans `app/main.py`
- Vérifier `NEXT_PUBLIC_FASTAPI_URL` dans Vercel
- Vérifier que le backend est bien déployé et accessible
- Vérifier les logs du navigateur (F12)

### Erreurs de base de données

- Vérifier que PostgreSQL est créé et connecté
- Vérifier `DATABASE_URL` dans les variables d'environnement
- Exécuter les migrations : `alembic upgrade head`

## 💰 Coûts

### Render (Free Tier)
- Web Service : 750 heures/mois gratuites
- PostgreSQL : 90 jours gratuits, puis $7/mois
- **Recommandation** : Utiliser le free tier pour tester

### Vercel (Free Tier)
- Next.js : Illimité (avec limitations)
- Bandwidth : 100GB/mois
- **Recommandation** : Parfait pour commencer

## 🎯 URLs de Déploiement

Après déploiement, vous aurez :
- **Backend API** : `https://ebay-arbitrage-api.onrender.com`
- **Frontend** : `https://ebay-arbitrage-web.vercel.app`
- **API Docs** : `https://ebay-arbitrage-api.onrender.com/docs`

