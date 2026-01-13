"use client";

import { CardData } from "@/types";
import Image from "next/image";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardGridProps {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

export default function CardGrid({ cards, onCardClick }: CardGridProps) {
  const getROIColor = (roi: number) => {
    if (roi >= 25) return "text-green-500";
    if (roi >= 15) return "text-yellow-500";
    return "text-red-500";
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("10")) return "bg-purple-500/20 text-purple-400";
    if (grade.includes("9")) return "bg-blue-500/20 text-blue-400";
    if (grade.includes("8")) return "bg-green-500/20 text-green-400";
    return "bg-gray-500/20 text-gray-400";
  };

  const getLanguageColor = (lang: string) => {
    if (lang === "JP") return "bg-red-500/20 text-red-400";
    if (lang === "FR") return "bg-blue-500/20 text-blue-400";
    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => onCardClick(card)}
        >
          {/* Card Image */}
          <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden">
            {card.image_url.startsWith('http') ? (
              <Image
                src={card.image_url}
                alt={card.card_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm p-2">
                {card.card_name}
              </div>
            )}
            <div className="absolute top-2 left-2 flex gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold",
                  getGradeColor(card.grade)
                )}
              >
                {card.grade}
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold",
                  getLanguageColor(card.language)
                )}
              >
                {card.language}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 rounded bg-black/70 text-white text-xs font-semibold">
                {card.game}
              </span>
            </div>
          </div>

          {/* Card Info */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2">
              {card.card_name}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix plancher</span>
                <span className="font-semibold">${card.floor_price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix listing</span>
                <span className="font-semibold">${card.listing_price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ROI estimé
                </span>
                <span className={cn("font-bold", getROIColor(card.roi))}>
                  {card.roi.toFixed(1)}%
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(card.ebay_url, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir sur eBay
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

