#!/bin/bash

echo "🚀 Démarrage du Frontend Next.js"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo ""
    echo "Installez Node.js avec une de ces méthodes:"
    echo "  1. brew install node  (macOS avec Homebrew)"
    echo "  2. Télécharger depuis https://nodejs.org/"
    echo "  3. Utiliser nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Vérifier .env.local
if [ ! -f ".env.local" ]; then
    echo "📝 Création du fichier .env.local..."
    echo "NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000" > .env.local
fi

echo "🌐 Démarrage du serveur de développement..."
echo "   Frontend: http://localhost:3000"
echo "   Backend attendu: http://localhost:8000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

npm run dev
