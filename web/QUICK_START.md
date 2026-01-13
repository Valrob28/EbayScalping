# 🚀 Démarrage Rapide - Frontend

## Installation Express (si Node.js n'est pas installé)

### macOS
```bash
brew install node
```

### Vérification
```bash
node --version  # Doit être v18+
npm --version
```

## Installation et Démarrage

```bash
# 1. Aller dans le dossier web
cd /Users/valentin/EbayScalping/web

# 2. Installer les dépendances (première fois seulement)
npm install

# 3. Démarrer le serveur de développement
npm run dev
```

## Accès

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000 (doit être démarré séparément)

## Commandes Utiles

```bash
# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Démarrer en mode production
npm start

# Vérifier le code
npm run lint
```

## Configuration

Le fichier `.env.local` est configuré pour pointer vers `http://localhost:8000`

Si votre backend tourne ailleurs, modifiez :
```env
NEXT_PUBLIC_FASTAPI_URL=http://votre-url-backend:port
```

## Problèmes Courants

### Port 3000 déjà utilisé
```bash
PORT=3001 npm run dev
```

### Erreurs de dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend non accessible
- Vérifier que le backend FastAPI est démarré sur le port 8000
- Vérifier `NEXT_PUBLIC_FASTAPI_URL` dans `.env.local`
- L'interface utilisera des données mock si le backend n'est pas disponible

