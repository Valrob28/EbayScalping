#!/bin/bash

echo "🚀 Démarrage complet - Backend + Frontend"
echo ""

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Vérifier le backend
if check_port 8000; then
    echo "✅ Backend FastAPI déjà démarré sur le port 8000"
else
    echo "⚠️  Backend FastAPI non démarré"
    echo "   Démarrez-le avec:"
    echo "   cd /Users/valentin/EbayScalping"
    echo "   source venv/bin/activate"
    echo "   uvicorn app.main:app --reload --port 8000"
    echo ""
fi

# Vérifier Node.js pour le frontend
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "   Installez-le avec: brew install node"
    echo ""
    exit 1
fi

# Démarrer le frontend
cd web
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

echo ""
echo "🌐 Démarrage du frontend..."
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo ""

npm run dev
