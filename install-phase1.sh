#!/bin/bash
echo "🚀 Installation Phase 1 - Création automatique"
mkdir -p app/api web/app/dashboard web/components/dashboard

# Créer fichiers vides
touch app/api/dashboard_routes.py
touch web/app/dashboard/page.tsx
touch web/components/Navigation.tsx
touch web/components/dashboard/HotOpportunities.tsx
touch web/components/dashboard/TrendingCards.tsx
touch web/components/dashboard/PriceChart.tsx
touch web/components/dashboard/MarketOverview.tsx

echo "✅ Fichiers créés ! Ouvrez GitHub Desktop maintenant."
echo ""
echo "Dans GitHub Desktop vous verrez 9 fichiers."
echo "Il suffit de:"
echo "1. Écrire 'feat: Phase 1 Dashboard'"
echo "2. Cliquer Commit"
echo "3. Cliquer Push"
