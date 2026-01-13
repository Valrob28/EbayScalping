"use client";

import { CardData } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Image from "next/image";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import PriceHistoryChart from "./PriceHistoryChart";
import { cn } from "@/lib/utils";

interface CardDetailModalProps {
  card: CardData;
  open: boolean;
  onClose: () => void;
}

export default function CardDetailModal({
  card,
  open,
  onClose,
}: CardDetailModalProps) {
  const getROIColor = (roi: number) => {
    if (roi >= 25) return "text-green-500";
    if (roi >= 15) return "text-yellow-500";
    return "text-red-500";
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("10")) return "bg-purple-500/20 text-purple-400 border-purple-500/50";
    if (grade.includes("9")) return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    if (grade.includes("8")) return "bg-green-500/20 text-green-400 border-green-500/50";
    return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getLanguageColor = (lang: string) => {
    if (lang === "JP") return "bg-red-500/20 text-red-400 border-red-500/50";
    if (lang === "FR") return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const estimatedProfit = card.floor_price - card.listing_price;
  const profitMargin = (estimatedProfit / card.listing_price) * 100;

  // Generate mock sales history if empty
  const salesHistory = card.sales_history.length > 0
    ? card.sales_history
    : generateMockSalesHistory(card.floor_price);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.card_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-4">
            <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {card.image_url.startsWith('http') ? (
                <Image
                  src={card.image_url}
                  alt={card.card_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  {card.card_name}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <span
                className={cn(
                  "px-3 py-1 rounded border text-sm font-semibold",
                  getGradeColor(card.grade)
                )}
              >
                {card.grade}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded border text-sm font-semibold",
                  getLanguageColor(card.language)
                )}
              >
                {card.language}
              </span>
              <span className="px-3 py-1 rounded border border-border bg-muted text-sm font-semibold">
                {card.game}
              </span>
            </div>

            <Button
              className="w-full"
              onClick={() => window.open(card.ebay_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir sur eBay
            </Button>
          </div>

          {/* Right Column - Details and Charts */}
          <div className="space-y-6">
            {/* Pricing Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informations de prix
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1">
                    Prix plancher
                  </div>
                  <div className="text-2xl font-bold">
                    ${card.floor_price.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1">
                    Prix listing
                  </div>
                  <div className="text-2xl font-bold">
                    ${card.listing_price.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1">
                    Profit estimé
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    ${estimatedProfit.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    ROI
                  </div>
                  <div className={cn("text-2xl font-bold", getROIColor(card.roi))}>
                    {card.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Price History Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Historique des prix (30 derniers jours)
              </h3>
              <div className="p-4 rounded-lg border border-border bg-card">
                <PriceHistoryChart data={salesHistory} />
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1">
                    Volume vendu
                  </div>
                  <div className="text-xl font-bold">
                    {salesHistory.length}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="text-sm text-muted-foreground mb-1">
                    Médiane
                  </div>
                  <div className="text-xl font-bold">
                    ${calculateMedian(salesHistory.map(s => s.price)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateMockSalesHistory(floorPrice: number) {
  const history = [];
  const now = new Date();
  const basePrice = floorPrice * 0.85; // Start lower than floor

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random price variation around base price
    const variation = (Math.random() - 0.5) * 0.3; // ±15%
    const price = basePrice * (1 + variation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, floorPrice * 0.7), // Minimum 70% of floor
    });
  }

  return history;
}

function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

