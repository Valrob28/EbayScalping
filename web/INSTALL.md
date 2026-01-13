# Guide d'Installation du Frontend

## Prérequis

Le frontend nécessite **Node.js 18+** et **npm**.

## Installation de Node.js

### Option 1: Avec Homebrew (macOS - Recommandé)

```bash
# Installer Homebrew si pas déjà installé
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Node.js
brew install node

# Vérifier l'installation
node --version  # Doit afficher v18.x.x ou supérieur
npm --version   # Doit afficher 9.x.x ou supérieur
```

### Option 2: Téléchargement direct

1. Aller sur https://nodejs.org/
2. Télécharger la version LTS (Long Term Support)
3. Installer le package .pkg
4. Vérifier l'installation dans le terminal

### Option 3: Avec nvm (Node Version Manager)

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Redémarrer le terminal ou exécuter
source ~/.bashrc

# Installer Node.js LTS
nvm install --lts
nvm use --lts

# Vérifier
node --version
npm --version
```

## Installation des Dépendances

Une fois Node.js installé :

```bash
cd /Users/valentin/EbayScalping/web
npm install
```

Cette commande va installer toutes les dépendances listées dans `package.json` :
- Next.js 14
- React 18
- TailwindCSS
- shadcn/ui components
- Recharts
- Et autres dépendances...

## Configuration

Le fichier `.env.local` est déjà créé avec la configuration par défaut :
```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

Si votre backend FastAPI tourne sur un autre port ou une autre URL, modifiez cette valeur.

## Démarrage du Frontend

```bash
cd /Users/valentin/EbayScalping/web
npm run dev
```

Le serveur de développement démarrera sur **http://localhost:3000**

## Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement (avec hot-reload)
- `npm run build` - Compile l'application pour la production
- `npm start` - Démarre le serveur de production (après build)
- `npm run lint` - Vérifie le code avec ESLint

## Dépannage

### Erreur "command not found: npm"
- Node.js n'est pas installé ou pas dans le PATH
- Réinstaller Node.js ou vérifier le PATH

### Erreur "EACCES: permission denied"
```bash
# Sur macOS/Linux, éviter d'utiliser sudo avec npm
# Utiliser nvm ou configurer npm pour utiliser un répertoire local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Erreur de port déjà utilisé
```bash
# Tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill -9

# Ou changer le port
PORT=3001 npm run dev
```

### Erreurs de dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Vérification

Une fois démarré, vous devriez voir :
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in Xs
```

Ouvrez http://localhost:3000 dans votre navigateur pour voir l'interface.

## Structure du Frontend

```
web/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API Next.js
│   ├── page.tsx           # Page d'accueil
│   └── layout.tsx          # Layout principal
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   ├── Filters.tsx        # Filtres de recherche
│   ├── MarketplaceView.tsx
│   └── ...
├── types/                # Types TypeScript
└── lib/                  # Utilitaires

```

## Prochaines Étapes

1. Installer Node.js (voir ci-dessus)
2. Installer les dépendances : `npm install`
3. Démarrer le backend FastAPI (port 8000)
4. Démarrer le frontend : `npm run dev`
5. Ouvrir http://localhost:3000

