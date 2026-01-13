# eBay Arbitrage Bot - Interface Web

Interface web de style Magic Eden pour le bot d'arbitrage de cartes à collectionner.

## Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (composants UI)
- **Recharts** (graphiques)
- **Radix UI** (primitives accessibles)

## Installation

1. Installer les dépendances:

```bash
cd web
npm install
```

2. Configurer les variables d'environnement:

```bash
cp .env.local.example .env.local
# Éditer .env.local avec l'URL de votre backend FastAPI
```

3. Démarrer le serveur de développement:

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Fonctionnalités

### Vue Marketplace
- **Vue Grille**: Affichage en cartes avec images
- **Vue Tableau**: Affichage tabulaire pour comparaison rapide
- **Actualisation automatique**: Mise à jour toutes les 30 secondes
- **Bouton de rafraîchissement manuel**

### Filtres
- **Recherche par nom** de carte
- **Filtre par jeu** (Pokémon, One Piece, Yu-Gi-Oh!)
- **Filtre par grade** (PSA 8/9/10, Raw)
- **Filtre par langue** (FR, EN, JP)
- **ROI minimum** (%)
- **Prix maximum** ($)
- **Type de listing** (Achat immédiat, Enchères)

### Modal de Détails
- **Image haute résolution** de la carte
- **Informations de prix**:
  - Prix plancher
  - Prix listing actuel
  - Profit estimé
  - ROI
- **Graphique d'historique des prix** (30 derniers jours)
- **Statistiques**:
  - Volume vendu
  - Prix médian
- **Lien direct vers eBay**

## Structure du Projet

```
web/
├── app/
│   ├── api/              # Routes API Next.js
│   ├── globals.css       # Styles globaux
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── Filters.tsx       # Composant de filtres
│   ├── MarketplaceView.tsx
│   ├── CardGrid.tsx      # Vue grille
│   ├── CardTable.tsx     # Vue tableau
│   ├── CardDetailModal.tsx
│   └── PriceHistoryChart.tsx
├── types/
│   └── index.ts          # Types TypeScript
└── lib/
    └── utils.ts          # Utilitaires
```

## Intégration avec le Backend

L'application communique avec le backend FastAPI via les routes API Next.js:

- `GET /api/opportunities` - Récupère toutes les opportunités
- `GET /api/card/[id]` - Récupère les détails d'une carte

Si le backend n'est pas disponible, l'application utilise des données mock pour le développement.

## Personnalisation

### Thème Sombre
Le thème sombre est activé par défaut dans `app/layout.tsx`. Pour le modifier, changez la classe `dark` sur l'élément `<html>`.

### Couleurs
Les couleurs sont définies dans `app/globals.css` via les variables CSS. Modifiez les valeurs HSL pour personnaliser le thème.

## Build de Production

```bash
npm run build
npm start
```

## Notes

- Les images de cartes utilisent des placeholders par défaut. Pour de vraies images, configurez les URLs eBay dans le backend.
- Le polling automatique peut être désactivé en modifiant l'intervalle dans `app/page.tsx`.
- Les données mock sont utilisées si le backend FastAPI n'est pas disponible.

