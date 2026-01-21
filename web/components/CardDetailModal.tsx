"use client";

import { CardData, SaleData } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
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

export default function CardDetailModal({ card, open, onClose }: CardDetailModalProps) {
  const getROIColor = (roi: number) =>
    roi >= 25 ? "text-green-500" : roi >= 15 ? "text-yellow-500" : "text-red-500";

  const getGradeColor = (grade: string) =>
    grade.includes("10")
      ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
      : grade.includes("9")
      ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
      : grade.includes("8")
      ? "bg-green-500/20 text-green-400 border-green-500/50"
      : "bg-gray-500/20 text-gray-400 border-gray-500/50";

  const getLanguageColor = (lang: string) =>
    lang === "JP"
      ? "bg-red-500/20 text-red-400 border-red-500/50"
      : lang === "FR"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
      : "bg-gray-500/20 text-gray-400 border-gray-500/50";

  const estimatedProfit = card.floor_price - card.listing_price;

  const salesHistory: SaleData[] =
    card.sales_history.length > 0
      ? card.sales_history
      : generateMockSalesHistory(card.floor_price);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.card_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left */}
          <div className="space-y-4">
            <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {card.image_url.startsWith("http") ? (
                <Image src={card.image_url} alt={card.card_name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
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
