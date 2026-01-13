# 🚀 Déploiement sur Render - Guide Étape par Étape

## ✅ Prérequis

- [x] Compte GitHub avec le repository `EbayScalping`
- [x] Code commité et poussé sur GitHub
- [x] Fichier `render.yaml` créé
- [x] `requirements.txt` à jour

## 📋 Étapes de Déploiement

### Étape 1 : Créer un Compte Render

1. Aller sur **https://render.com**
2. Cliquer sur **"Get Started for Free"**
3. Choisir **"Sign up with GitHub"**
4. Autoriser Render à accéder à votre GitHub

### Étape 2 : Créer un Blueprint (Recommandé)

#### Option A : Blueprint Automatique (Plus Simple)

1. Dans le Dashboard Render, cliquer sur **"New +"**
2. Sélectionner **"Blueprint"**
3. Connecter votre repository GitHub `EbayScalping`
4. Render détectera automatiquement le fichier `render.yaml`
5. Cliquer sur **"Apply"**

Render créera automatiquement :
- ✅ Backend API service
- ✅ Frontend Web service  
- ✅ PostgreSQL database
- ✅ Variables d'environnement liées

#### Option B : Services Manuels (Plus de Contrôle)

Si vous préférez créer les services manuellement :

**2.1 Créer la Base de Données PostgreSQL**

1. "New +" → **"PostgreSQL"**
2. Configurer :
   - **Name** : `ebay-arbitrage-db`
   - **Database** : `ebay_arbitrage`
   - **User** : `ebay_user` (ou laisser par défaut)
   - **Plan** : **Free** (pour commencer)
3. Cliquer sur **"Create Database"**
4. **Noter l'Internal Database URL** (sera utilisé pour `DATABASE_URL`)

**2.2 Créer le Backend API**

1. "New +" → **"Web Service"**
2. Connecter votre repository GitHub `EbayScalping`
3. Configurer :
   ```
   Name: ebay-arbitrage-api
   Environment: Python 3
   Region: (choisir le plus proche)
   Branch: main
   Root Directory: (laisser vide)
   Build Command: pip install -r requirements.txt && alembic upgrade head
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. **Plan** : **Free** (pour commencer)
5. Cliquer sur **"Create Web Service"**

**2.3 Créer le Frontend**

1. "New +" → **"Web Service"**
2. Connecter le même repository GitHub `EbayScalping`
3. Configurer :
   ```
   Name: ebay-arbitrage-web
   Environment: Node
   Region: (même que backend)
   Branch: main
   Root Directory: web
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. **Plan** : **Free**
5. Cliquer sur **"Create Web Service"**

### Étape 3 : Configurer les Variables d'Environnement

#### Backend (`ebay-arbitrage-api`)

Dans le Dashboard Render → Votre service backend → **"Environment"** :

**Variables obligatoires :**
```
EBAY_APP_ID = votre_clé_ebay_app_id
EBAY_CLIENT_ID = votre_client_id_ebay
EBAY_CLIENT_SECRET = votre_secret_ebay
```

**Variables automatiques (si base créée) :**
```
DATABASE_URL = (auto-rempli par Render si base connectée)
```

**Variables optionnelles :**
```
SHIPPING_COST = 5.0
ARBITRAGE_THRESHOLD = 0.8
MIN_SALES_FOR_FLOOR = 5
MAX_SALES_FOR_FLOOR = 10
FRONTEND_URL = https://ebay-arbitrage-web.onrender.com
```

**Comment ajouter :**
1. Aller dans **"Environment"**
2. Cliquer sur **"Add Environment Variable"**
3. Ajouter chaque variable une par une
4. Cliquer sur **"Save Changes"**

#### Frontend (`ebay-arbitrage-web`)

Dans le Dashboard Render → Votre service frontend → **"Environment"** :

```
NEXT_PUBLIC_FASTAPI_URL = https://ebay-arbitrage-api.onrender.com
```

**Important** : Remplacez `ebay-arbitrage-api` par le nom réel de votre service backend.

### Étape 4 : Connecter la Base de Données au Backend

1. Aller dans votre service backend
2. Section **"Connections"**
3. Cliquer sur **"Link Resource"**
4. Sélectionner votre base PostgreSQL `ebay-arbitrage-db`
5. Render ajoutera automatiquement `DATABASE_URL`

### Étape 5 : Déployer

#### Si vous avez utilisé le Blueprint

1. Render déploiera automatiquement les deux services
2. Attendre que les builds se terminent (5-10 minutes)
3. Vérifier les logs pour les erreurs

#### Si vous avez créé manuellement

1. Les services se déploient automatiquement après création
2. Vérifier les logs dans chaque service
3. Attendre que les builds se terminent

### Étape 6 : Vérifier le Déploiement

#### Backend

1. Aller dans votre service backend
2. Cliquer sur l'URL (ex: `https://ebay-arbitrage-api.onrender.com`)
3. Tester :
   - `/health` → Devrait retourner `{"status":"healthy"}`
   - `/docs` → Devrait afficher la documentation Swagger
   - `/api/opportunities` → Devrait retourner `[]` (vide au début)

#### Frontend

1. Aller dans votre service frontend
2. Cliquer sur l'URL (ex: `https://ebay-arbitrage-web.onrender.com`)
3. L'interface devrait s'afficher
4. Si erreur, vérifier `NEXT_PUBLIC_FASTAPI_URL` dans les variables

### Étape 7 : Exécuter les Migrations (Important !)

Les migrations sont dans le build command, mais si elles échouent :

1. Aller dans votre service backend
2. Cliquer sur **"Shell"** (en haut à droite)
3. Exécuter :
   ```bash
   alembic upgrade head
   ```
4. Vérifier qu'il n'y a pas d'erreurs

## 🔧 Configuration CORS

Le backend est déjà configuré pour accepter les requêtes depuis le frontend Render.

Si vous avez des erreurs CORS :

1. Vérifier que `FRONTEND_URL` est configuré dans le backend
2. Ou modifier `app/main.py` pour ajouter votre URL frontend

## 📊 URLs Après Déploiement

- **Backend API** : `https://ebay-arbitrage-api.onrender.com`
- **API Docs** : `https://ebay-arbitrage-api.onrender.com/docs`
- **Frontend** : `https://ebay-arbitrage-web.onrender.com`

## 🐛 Dépannage

### Backend ne démarre pas

**Erreur : "Module not found"**
- Vérifier que `requirements.txt` contient toutes les dépendances
- Vérifier les logs de build

**Erreur : "Database connection failed"**
- Vérifier que `DATABASE_URL` est configuré
- Vérifier que la base est connectée au service
- Vérifier les logs pour les erreurs de connexion

**Erreur : "Port already in use"**
- Vérifier que le `startCommand` utilise `$PORT` (variable Render)

### Frontend ne démarre pas

**Erreur : "Build failed"**
- Vérifier que `rootDir: web` est configuré
- Vérifier que `package.json` existe dans `web/`
- Vérifier les logs de build

**Erreur : "Cannot connect to backend"**
- Vérifier `NEXT_PUBLIC_FASTAPI_URL` dans les variables
- Vérifier que le backend est démarré
- Vérifier CORS dans le backend

### Base de données

**Erreur : "Table does not exist"**
- Exécuter les migrations : `alembic upgrade head` dans le shell
- Vérifier que les migrations sont dans le build command

## 💰 Coûts

### Free Tier

- **2 Web Services** : 750 heures/mois chacun (gratuit)
- **PostgreSQL** : 90 jours gratuits, puis $7/mois
- **Total** : Gratuit pendant 3 mois, puis $7/mois

### Limitations Free Tier

- ⚠️ Services mis en veille après 15 min d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes
- ⚠️ Pas de SSL personnalisé (mais HTTPS inclus)

## ✅ Checklist Finale

- [ ] Compte Render créé
- [ ] Repository GitHub connecté
- [ ] Services créés (backend + frontend + database)
- [ ] Variables d'environnement configurées
- [ ] Base de données connectée au backend
- [ ] Migrations exécutées
- [ ] Backend accessible (`/health` fonctionne)
- [ ] Frontend accessible et connecté au backend
- [ ] Test de l'interface complète

## 🎯 Prochaines Étapes Après Déploiement

1. **Tester l'API** :
   ```bash
   curl https://votre-api.onrender.com/health
   ```

2. **Tester le frontend** :
   - Ouvrir l'URL du frontend
   - Vérifier que les données s'affichent

3. **Configurer les clés eBay** :
   - Ajouter vos vraies clés dans les variables d'environnement
   - Redéployer si nécessaire

4. **Monitorer** :
   - Vérifier les logs régulièrement
   - Surveiller les erreurs

5. **Upgrade si nécessaire** :
   - Après 90 jours, PostgreSQL passera à $7/mois
   - Ou migrer vers un autre provider

## 📝 Notes Importantes

- Les services free tier se mettent en veille après inactivité
- Le premier démarrage peut être lent (cold start)
- Les builds peuvent prendre 5-10 minutes
- Sauvegardez vos variables d'environnement (elles ne sont pas visibles après création)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs dans Render Dashboard
2. Vérifier la documentation Render : https://render.com/docs
3. Vérifier que tous les fichiers sont commités et poussés sur GitHub

