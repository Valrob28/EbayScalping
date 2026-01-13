"use client";

import { useState } from "react";
import { CardData } from "@/types";
import CardGrid from "./CardGrid";
import CardTable from "./CardTable";
import CardDetailModal from "./CardDetailModal";
import { Button } from "./ui/button";
import { RefreshCw, Grid, Table } from "lucide-react";

interface MarketplaceViewProps {
  cards: CardData[];
  loading: boolean;
  onRefresh: () => void;
}

type ViewMode = "grid" | "table";

export default function MarketplaceView({
  cards,
  loading,
  onRefresh,
}: MarketplaceViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {cards.length} opportunité{cards.length > 1 ? "s" : ""} trouvée
            {cards.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grille
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table className="h-4 w-4 mr-2" />
            Tableau
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {loading && cards.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Aucune opportunité trouvée
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Essayez de modifier vos filtres
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <CardGrid cards={cards} onCardClick={setSelectedCard} />
      ) : (
        <CardTable cards={cards} onCardClick={setSelectedCard} />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}

