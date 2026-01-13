# 🚀 Guide Déploiement Render - Étape par Étape

## 📋 Prérequis

- ✅ Code commité et poussé sur GitHub
- ✅ Compte Render créé (gratuit)

## 🎯 Étapes sur Render

### Étape 1 : Créer un Compte Render

1. Aller sur **https://render.com**
2. Cliquer sur **"Get Started for Free"**
3. Choisir **"Sign up with GitHub"**
4. Autoriser Render à accéder à votre GitHub

### Étape 2 : Créer un Blueprint (Méthode Automatique - Recommandée)

1. Dans le Dashboard Render, cliquer sur **"New +"** (en haut à droite)
2. Sélectionner **"Blueprint"**
3. Connecter votre repository GitHub :
   - Cliquer sur **"Connect GitHub"** si pas encore connecté
   - Autoriser Render à accéder à vos repos
   - Sélectionner le repo **`EbayScalping`**
4. Render détectera automatiquement le fichier `render.yaml`
5. Vous verrez un aperçu de ce qui sera créé :
   - ✅ Web Service : `ebay-arbitrage-api` (Backend)
   - ✅ Web Service : `ebay-arbitrage-web` (Frontend)
   - ✅ PostgreSQL Database : `ebay-arbitrage-db`
6. Cliquer sur **"Apply"**

### Étape 3 : Attendre le Déploiement

Render va automatiquement :
- ✅ Créer les 3 services
- ✅ Installer les dépendances
- ✅ Builder les applications
- ✅ Connecter la base de données au backend
- ✅ Configurer les variables d'environnement liées

**Temps estimé : 5-10 minutes**

### Étape 4 : Vérifier les Services

Une fois le déploiement terminé :

1. **Backend API** :
   - Cliquer sur le service `ebay-arbitrage-api`
   - Vérifier l'URL : `https://ebay-arbitrage-api.onrender.com`
   - Tester : Cliquer sur l'URL ou `/health`

2. **Frontend Web** :
   - Cliquer sur le service `ebay-arbitrage-web`
   - Vérifier l'URL : `https://ebay-arbitrage-web.onrender.com`
   - Ouvrir l'URL dans le navigateur

3. **Base de Données** :
   - Cliquer sur `ebay-arbitrage-db`
   - Vérifier qu'elle est connectée au backend

### Étape 5 : Vérifier les Logs

Pour chaque service :

1. Cliquer sur le service
2. Aller dans l'onglet **"Logs"**
3. Vérifier qu'il n'y a pas d'erreurs
4. Chercher des messages comme :
   - ✅ "Application startup complete"
   - ✅ "Uvicorn running on"
   - ✅ "Build successful"

### Étape 6 : Tester l'Application

#### Tester le Backend

```bash
# Health check
curl https://ebay-arbitrage-api.onrender.com/health

# Devrait retourner : {"status":"healthy"}

# API Docs
# Ouvrir dans le navigateur :
https://ebay-arbitrage-api.onrender.com/docs
```

#### Tester le Frontend

1. Ouvrir l'URL du frontend dans le navigateur
2. L'interface devrait s'afficher
3. Si erreur, vérifier les logs du frontend

#### Tester le Scraping

```bash
# Tester le scraping (sans clés API)
curl -X POST "https://ebay-arbitrage-api.onrender.com/api/fetch-sales?search_query=Pokemon%20Charizard"
```

## 🔧 Configuration Optionnelle

### Variables d'Environnement (Optionnel)

Le scraping fonctionne **sans configuration**, mais vous pouvez ajouter :

**Backend (`ebay-arbitrage-api`)** → **"Environment"** :

```
SCRAPING_DELAY=2.0
SCRAPING_MAX_REQUESTS_PER_HOUR=100
```

**Frontend (`ebay-arbitrage-web`)** :

Aucune variable nécessaire ! `NEXT_PUBLIC_FASTAPI_URL` est déjà configurée automatiquement.

### Si vous Obtenez des Clés eBay Plus Tard

Dans le backend → **"Environment"** :

```
USE_SCRAPING_MODE=false
EBAY_APP_ID=votre_clé
EBAY_CLIENT_ID=votre_id
EBAY_CLIENT_SECRET=votre_secret
```

Puis **"Manual Deploy"** → **"Deploy latest commit"**

## 🐛 Dépannage

### Backend ne démarre pas

**Vérifier les logs** :
1. Backend → "Logs"
2. Chercher les erreurs
3. Erreurs communes :
   - "Module not found" → Vérifier `requirements.txt`
   - "Database connection failed" → Vérifier que la DB est connectée
   - "Port already in use" → Normal, Render gère ça

**Solution** :
- Vérifier que toutes les dépendances sont dans `requirements.txt`
- Vérifier que la base de données est connectée

### Frontend ne démarre pas

**Vérifier les logs** :
1. Frontend → "Logs"
2. Erreurs communes :
   - "Build failed" → Vérifier `package.json`
   - "Cannot find module" → Vérifier les dépendances

**Solution** :
- Vérifier que `rootDir: web` est dans `render.yaml`
- Vérifier que `package.json` existe dans `web/`

### Frontend ne peut pas accéder au backend

**Vérifier** :
1. Backend est démarré et accessible
2. `NEXT_PUBLIC_FASTAPI_URL` est configurée (automatique avec Blueprint)
3. CORS est configuré dans le backend (déjà fait)

**Solution** :
- Vérifier l'URL du backend dans les variables du frontend
- Vérifier les logs du navigateur (F12)

### Base de données

**Vérifier** :
1. Base de données créée
2. Connectée au backend (dans "Connections")
3. `DATABASE_URL` est dans les variables (automatique)

**Exécuter les migrations** :
1. Backend → "Shell"
2. Exécuter : `alembic upgrade head`
3. Ou vérifier que c'est dans le build command (déjà fait)

## 📊 URLs Après Déploiement

Une fois déployé, vous aurez :

- **Backend API** : `https://ebay-arbitrage-api.onrender.com`
- **API Docs** : `https://ebay-arbitrage-api.onrender.com/docs`
- **Frontend** : `https://ebay-arbitrage-web.onrender.com`
- **Health Check** : `https://ebay-arbitrage-api.onrender.com/health`

## ✅ Checklist Finale

- [ ] Compte Render créé
- [ ] Blueprint créé et appliqué
- [ ] Services déployés (backend + frontend + database)
- [ ] Backend accessible (`/health` fonctionne)
- [ ] Frontend accessible (interface s'affiche)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test du scraping réussi

## 🎯 Prochaines Étapes

1. **Tester l'application complète** :
   - Utiliser l'interface web
   - Rechercher des cartes
   - Vérifier les opportunités détectées

2. **Monitorer** :
   - Vérifier les logs régulièrement
   - Surveiller les erreurs
   - Vérifier les performances

3. **Améliorer** :
   - Ajouter des clés eBay API si disponibles
   - Optimiser le scraping
   - Ajouter plus de fonctionnalités

## 💡 Astuces

- **Free Tier** : Les services se mettent en veille après 15 min d'inactivité
- **Premier démarrage** : Peut prendre 30-60 secondes (cold start)
- **Logs** : Très utiles pour déboguer
- **Manual Deploy** : Pour redéployer après un changement

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs dans Render Dashboard
2. Vérifier la documentation Render : https://render.com/docs
3. Vérifier que tous les fichiers sont dans le repo GitHub

## 🎉 C'est Tout !

Votre application est maintenant déployée sur Render et fonctionne avec le scraping ! 🚀

