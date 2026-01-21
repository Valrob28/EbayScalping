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

interface SaleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  average: number;
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

  // Générer mock salesHistory si vide
  const rawHistory = card.sales_history.length > 0
    ? card.sales_history
    : generateMockSalesHistory(card.floor_price);

  // 🔹 Mapping en SaleData pour le chart
  const salesHistory: SaleData[] = rawHistory.map((s) => ({
    date: s.date,
    open: s.price,
    high: s.price,
    low: s.price,
    close: s.price,
    volume: s.quantity ?? 1,
    average: s.price,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.card_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Image & Info */}
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
              <span className={cn("px-3 py-1 rounded border text-sm font-semibold", getGradeColor(card.grade))}>
                {card.grade}
              </span>
              <span className={cn("px-3 py-1 rounded border text-sm font-semibold", getLanguageColor(card.language))}>
                {card.language}
              </span>
              <span className="px-3 py-1 rounded border border-border bg-muted text-sm font-semibold">
                {card.game}
              </span>
            </div>

            <Button className="w-full" onClick={() => window.open(card.ebay_url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir sur eBay
            </Button>
          </div>

          {/* Right Column - Charts & Stats */}
          <div className="space-y-6">
            {/* Pricing Info */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Prix plancher" value={`$${card.floor_price.toFixed(2)}`} />
              <StatCard label="Prix listing" value={`$${card.listing_price.toFixed(2)}`} />
              <StatCard label="Profit estimé" value={`$${estimatedProfit.toFixed(2)}`} className="text-green-500" />
              <StatCard label="ROI" value={`${card.roi.toFixed(1)}%`} className={getROIColor(card.roi)} />
            </div>

            {/* Price History Chart */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Historique des prix (30 derniers jours)
              </h3>
              <div className="p-4 rounded-lg border border-border bg-card">
                <PriceHistoryChart data={salesHistory} />
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Volume vendu" value={salesHistory.reduce((acc, s) => acc + s.volume, 0)} />
              <StatCard label="Médiane" value={`$${calculateMedian(salesHistory.map(s => s.average)).toFixed(2)}`} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg border border-border bg-card text-center", className)}>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

// 🔹 Helpers
function generateMockSalesHistory(floorPrice: number) {
  const history = [];
  const now = new Date();
  const basePrice = floorPrice * 0.85;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 0.3;
    const price = basePrice * (1 + variation);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, floorPrice * 0.7),
      quantity: Math.floor(Math.random() * 5) + 1
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
