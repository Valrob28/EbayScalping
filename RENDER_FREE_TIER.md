# 💰 Déploiement Render - Plan Gratuit (Free Tier)

## ✅ Configuration Free Tier

Le fichier `render.yaml` est maintenant configuré pour le **plan gratuit**.

## 📋 Ce qui est Inclus dans le Free Tier

### Web Services (2 services gratuits)
- ✅ **750 heures/mois** par service (gratuit)
- ✅ **HTTPS inclus** automatiquement
- ✅ **Auto-deploy** sur push GitHub
- ⚠️ **Mise en veille** après 15 min d'inactivité

### PostgreSQL Database
- ✅ **90 jours gratuits**
- ✅ **1 GB de stockage**
- ⚠️ **$7/mois** après 90 jours

## 🚀 Déploiement avec Free Tier

### Méthode 1 : Blueprint (Recommandé)

1. Aller sur **https://render.com**
2. **"New +"** → **"Blueprint"**
3. Connecter votre repo GitHub
4. Render détecte `render.yaml`
5. **Important** : Vérifier que les plans sont sur **"Free"**
6. Cliquer sur **"Apply"**

### Méthode 2 : Services Manuels

Si vous créez les services manuellement :

#### Backend
1. **"New +"** → **"Web Service"**
2. Connecter repo GitHub
3. **Plan** : Sélectionner **"Free"** (pas Starter ou Standard)
4. Configurer les autres paramètres

#### Frontend
1. **"New +"** → **"Web Service"**
2. Connecter le même repo
3. **Plan** : Sélectionner **"Free"**
4. **Root Directory** : `web`

#### Database
1. **"New +"** → **"PostgreSQL"**
2. **Plan** : Sélectionner **"Free"**
3. Connecter au backend

## ⚠️ Limitations du Free Tier

### Mise en Veille

- Les services se mettent en **veille après 15 minutes d'inactivité**
- Le **premier démarrage** peut prendre **30-60 secondes** (cold start)
- Les requêtes suivantes sont rapides

### Solutions pour Éviter la Mise en Veille

1. **Utiliser un service de monitoring** :
   - UptimeRobot (gratuit)
   - Cron-job.org
   - Configurer un ping toutes les 5 minutes

2. **Utiliser Render Cron Jobs** (si disponible) :
   - Créer un cron job qui ping votre service

3. **Accepter la mise en veille** :
   - Le premier utilisateur attendra 30-60 secondes
   - Les suivants seront rapides

### Base de Données

- **90 jours gratuits** puis **$7/mois**
- Alternative : Utiliser SQLite (gratuit mais moins performant)
- Ou migrer vers un autre provider gratuit (Supabase, Railway, etc.)

## 💡 Optimisations pour Free Tier

### 1. Réduire les Builds

- Éviter les builds inutiles
- Utiliser le cache de Render
- Optimiser les dépendances

### 2. Optimiser les Requêtes

- Mettre en cache les résultats
- Réduire la fréquence des requêtes scraping
- Utiliser des délais entre requêtes

### 3. Monitoring

Créer un fichier `ping.py` pour garder le service actif :

```python
# ping.py
import requests
import time
import os

def ping_service():
    url = os.getenv("SERVICE_URL", "https://ebay-arbitrage-api.onrender.com/health")
    try:
        response = requests.get(url, timeout=10)
        print(f"Ping réussi: {response.status_code}")
    except Exception as e:
        print(f"Erreur ping: {e}")

if __name__ == "__main__":
    while True:
        ping_service()
        time.sleep(300)  # Toutes les 5 minutes
```

## 📊 Coûts

### Free Tier (3 premiers mois)
- **Backend** : Gratuit (750h/mois)
- **Frontend** : Gratuit (750h/mois)
- **PostgreSQL** : Gratuit (90 jours)
- **Total** : **$0/mois**

### Après 90 jours
- **Backend** : Gratuit
- **Frontend** : Gratuit
- **PostgreSQL** : $7/mois
- **Total** : **$7/mois**

## 🔄 Alternatives Gratuites

Si vous voulez rester 100% gratuit après 90 jours :

### Option 1 : SQLite (Gratuit)
Modifier `render.yaml` pour utiliser SQLite au lieu de PostgreSQL.

### Option 2 : Supabase (Gratuit)
- PostgreSQL gratuit jusqu'à 500 MB
- Migrer la base vers Supabase
- Modifier `DATABASE_URL` dans Render

### Option 3 : Railway (Gratuit)
- $5 de crédit gratuit/mois
- PostgreSQL inclus
- Alternative à Render

## ✅ Checklist Free Tier

- [ ] Services créés avec plan "Free"
- [ ] Base PostgreSQL sur plan "Free"
- [ ] Comprendre la mise en veille (15 min)
- [ ] Configurer un monitoring (optionnel)
- [ ] Accepter le cold start (30-60 sec)

## 🎯 Configuration Actuelle

Le `render.yaml` est maintenant configuré avec `plan: free` pour :
- ✅ Backend API
- ✅ Frontend Web
- ✅ PostgreSQL Database

Tout est prêt pour le déploiement gratuit !

