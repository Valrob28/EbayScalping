# 🚀 Déploiement Rapide

## Option Recommandée : Render (Backend) + Vercel (Frontend)

### ⚡ Déploiement Backend sur Render (5 minutes)

1. **Créer un compte Render** : https://render.com (gratuit avec GitHub)

2. **Créer un Web Service** :
   - "New +" → "Web Service"
   - Connecter votre repo GitHub `EbayScalping`
   - Configurer :
     ```
     Name: ebay-arbitrage-api
     Environment: Python 3
     Build Command: pip install -r requirements.txt && alembic upgrade head
     Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

3. **Créer une base PostgreSQL** :
   - "New +" → "PostgreSQL"
   - Plan : Free
   - Nom : `ebay-arbitrage-db`
   - Connecter au service web

4. **Ajouter les variables d'environnement** :
   - `EBAY_APP_ID` : Votre clé eBay
   - `EBAY_CLIENT_ID` : Votre client ID
   - `EBAY_CLIENT_SECRET` : Votre secret
   - `DATABASE_URL` : Automatiquement rempli par Render

5. **Déployer** : Cliquer sur "Create Web Service"

6. **Noter l'URL** : `https://ebay-arbitrage-api.onrender.com`

### ⚡ Déploiement Frontend sur Vercel (3 minutes)

1. **Créer un compte Vercel** : https://vercel.com (gratuit avec GitHub)

2. **Importer le projet** :
   - "Add New Project"
   - Sélectionner le repo `EbayScalping`
   - Configurer :
     ```
     Framework Preset: Next.js
     Root Directory: web
     Build Command: npm run build (auto)
     Output Directory: .next (auto)
     ```

3. **Ajouter la variable d'environnement** :
   - `NEXT_PUBLIC_FASTAPI_URL` : `https://ebay-arbitrage-api.onrender.com`

4. **Déployer** : Cliquer sur "Deploy"

5. **Noter l'URL** : `https://ebay-arbitrage-web.vercel.app`

### 🔧 Mettre à jour CORS

Dans Render, ajouter la variable d'environnement :
- `FRONTEND_URL` : `https://ebay-arbitrage-web.vercel.app`

Ou modifier directement dans `app/main.py` pour ajouter votre URL Vercel.

## ✅ Vérification

1. **Backend** : https://votre-api.onrender.com/health
2. **API Docs** : https://votre-api.onrender.com/docs
3. **Frontend** : https://votre-app.vercel.app

## 🎯 URLs Finales

- **Backend API** : `https://ebay-arbitrage-api.onrender.com`
- **Frontend** : `https://ebay-arbitrage-web.vercel.app`
- **API Docs** : `https://ebay-arbitrage-api.onrender.com/docs`

## 📝 Notes Importantes

- Le free tier de Render met le service en veille après 15 min d'inactivité
- Le premier démarrage peut prendre 30-60 secondes
- Vercel déploie automatiquement à chaque push sur `main`
- Render peut être configuré pour auto-deploy sur push

## 🐛 Problèmes Courants

**Backend en veille** : Le free tier Render met en veille après inactivité. Le premier appel peut être lent.

**CORS errors** : Vérifier que `FRONTEND_URL` est configuré dans Render et que CORS accepte votre domaine Vercel.

**Database errors** : Vérifier que les migrations Alembic sont exécutées dans le build command.

