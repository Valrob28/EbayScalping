# 🚀 Déploiement Tout sur Render

## ✅ Oui, vous pouvez tout déployer sur Render !

Render supporte à la fois :
- **Python** (Backend FastAPI)
- **Node.js** (Frontend Next.js)

## 📋 Configuration

Le fichier `render.yaml` est déjà configuré pour déployer les deux services sur Render.

### Services Configurés

1. **Backend API** (`ebay-arbitrage-api`)
   - Python/FastAPI
   - Port dynamique via `$PORT`
   - Base de données PostgreSQL connectée

2. **Frontend Web** (`ebay-arbitrage-web`)
   - Node.js/Next.js
   - Root Directory : `web`
   - Connecté automatiquement au backend

## 🚀 Étapes de Déploiement

### 1. Préparer le Repository

```bash
# Vérifier que tout est commité
git add .
git commit -m "feat: Configuration déploiement Render complet"
git push origin main
```

### 2. Déployer sur Render

#### Option A : Déploiement Automatique avec render.yaml

1. **Aller sur Render** : https://render.com
2. **Créer un compte** (gratuit avec GitHub)
3. **"New +" → "Blueprint"** (ou "New +" → "Render Blueprint")
4. **Connecter votre repository GitHub**
5. **Sélectionner le repo** `EbayScalping`
6. **Render détectera automatiquement `render.yaml`**
7. **Appliquer la configuration**
8. **Créer les services**

Render créera automatiquement :
- ✅ Backend API service
- ✅ Frontend Web service
- ✅ PostgreSQL database
- ✅ Variables d'environnement liées

#### Option B : Déploiement Manuel (Service par Service)

**Backend :**

1. "New +" → "Web Service"
2. Connecter repo GitHub
3. Configurer :
   ```
   Name: ebay-arbitrage-api
   Environment: Python 3
   Root Directory: (laisser vide)
   Build Command: pip install -r requirements.txt && alembic upgrade head
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Créer PostgreSQL database
5. Ajouter variables d'environnement

**Frontend :**

1. "New +" → "Web Service"
2. Connecter le même repo GitHub
3. Configurer :
   ```
   Name: ebay-arbitrage-web
   Environment: Node
   Root Directory: web
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. Ajouter variable :
   ```
   NEXT_PUBLIC_FASTAPI_URL = https://ebay-arbitrage-api.onrender.com
   ```

### 3. Configurer les Variables d'Environnement

#### Backend (`ebay-arbitrage-api`)

Dans Render Dashboard → Settings → Environment Variables :

```
EBAY_APP_ID = votre_clé_ebay
EBAY_CLIENT_ID = votre_client_id
EBAY_CLIENT_SECRET = votre_secret
DATABASE_URL = (auto-rempli par Render)
FRONTEND_URL = https://ebay-arbitrage-web.onrender.com
```

#### Frontend (`ebay-arbitrage-web`)

```
NEXT_PUBLIC_FASTAPI_URL = https://ebay-arbitrage-api.onrender.com
```

### 4. Exécuter les Migrations

Une fois le backend déployé, exécuter les migrations :

**Option A : Via Shell Render**
1. Aller dans le service backend
2. "Shell" → Ouvrir le shell
3. Exécuter : `alembic upgrade head`

**Option B : Via Build Command**
Les migrations sont déjà dans le build command : `alembic upgrade head`

## 🔧 Configuration CORS

Le backend est configuré pour accepter les requêtes depuis le frontend Render.

Dans `app/main.py`, CORS accepte automatiquement :
- `localhost:3000` (développement local)
- Toutes les origines en production Render

## 📊 URLs Après Déploiement

- **Backend API** : `https://ebay-arbitrage-api.onrender.com`
- **API Docs** : `https://ebay-arbitrage-api.onrender.com/docs`
- **Frontend** : `https://ebay-arbitrage-web.onrender.com`

## 💰 Coûts

### Free Tier Render

- **2 Web Services** : 750 heures/mois chacun (gratuit)
- **PostgreSQL** : 90 jours gratuits, puis $7/mois
- **Total** : Gratuit pour les 3 premiers mois, puis $7/mois

### Limitations Free Tier

- ⚠️ Services mis en veille après 15 min d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes
- ⚠️ Pas de SSL personnalisé (mais HTTPS inclus)

## ✅ Avantages de Tout Mettre sur Render

- ✅ **Un seul provider** : Tout au même endroit
- ✅ **Configuration centralisée** : Un seul `render.yaml`
- ✅ **Variables liées** : Les services se connectent automatiquement
- ✅ **Monitoring unifié** : Logs et métriques au même endroit
- ✅ **Déploiement simplifié** : Un seul push déploie tout

## 🐛 Dépannage

### Frontend ne peut pas accéder au backend

1. Vérifier `NEXT_PUBLIC_FASTAPI_URL` dans les variables d'environnement
2. Vérifier que le backend est démarré et accessible
3. Vérifier CORS dans `app/main.py`
4. Vérifier les logs dans Render Dashboard

### Erreur de build Frontend

1. Vérifier que `rootDir: web` est configuré
2. Vérifier que `package.json` existe dans `web/`
3. Vérifier les logs de build dans Render

### Base de données non connectée

1. Vérifier que PostgreSQL est créé
2. Vérifier que `DATABASE_URL` est dans les variables d'environnement
3. Vérifier que les migrations sont exécutées

## 📝 Checklist

- [ ] Repository GitHub créé et poussé
- [ ] Compte Render créé
- [ ] Blueprint créé ou services créés manuellement
- [ ] PostgreSQL database créée
- [ ] Variables d'environnement configurées
- [ ] Migrations Alembic exécutées
- [ ] Backend accessible : `/health`
- [ ] Frontend accessible et connecté au backend
- [ ] Test de l'interface complète

## 🎯 Prochaines Étapes

1. Pousser le code sur GitHub
2. Créer un Blueprint sur Render
3. Configurer les variables d'environnement
4. Tester les deux services
5. Profiter ! 🎉

