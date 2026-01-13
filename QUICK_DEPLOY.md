# ⚡ Déploiement Rapide sur Render (5 minutes)

## 🚀 Étapes Ultra-Rapides

### 1. Préparer le Code (1 min)

```bash
# Vérifier que tout est commité
git add .
git commit -m "feat: Prêt pour déploiement Render"
git push origin main
```

### 2. Créer le Compte Render (1 min)

1. Aller sur **https://render.com**
2. **"Get Started"** → **"Sign up with GitHub"**
3. Autoriser l'accès

### 3. Créer le Blueprint (2 min)

1. **"New +"** → **"Blueprint"**
2. Connecter repo **`EbayScalping`**
3. Render détecte `render.yaml` automatiquement
4. **"Apply"** → Render crée tout automatiquement

### 4. Configurer les Clés eBay (1 min)

Dans le service backend → **"Environment"** :

```
EBAY_APP_ID = votre_clé
EBAY_CLIENT_ID = votre_id
EBAY_CLIENT_SECRET = votre_secret
```

### 5. Attendre le Déploiement (2-5 min)

- Render build automatiquement
- Vérifier les logs
- Tester les URLs

## ✅ URLs Finales

- Backend : `https://ebay-arbitrage-api.onrender.com`
- Frontend : `https://ebay-arbitrage-web.onrender.com`
- Docs : `https://ebay-arbitrage-api.onrender.com/docs`

## 🎯 C'est Tout !

Votre application est déployée ! 🎉

