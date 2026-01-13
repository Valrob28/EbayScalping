"use client";

import { CardData } from "@/types";
import Image from "next/image";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardTableProps {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

export default function CardTable({ cards, onCardClick }: CardTableProps) {
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
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Carte</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Jeu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Langue</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Prix plancher</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Prix listing</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">ROI</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, index) => (
              <tr
                key={card.id}
                className={cn(
                  "border-t border-border hover:bg-muted/30 transition-colors cursor-pointer",
                  index % 2 === 0 && "bg-card"
                )}
                onClick={() => onCardClick(card)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      {card.image_url.startsWith('http') ? (
                        <Image
                          src={card.image_url}
                          alt={card.card_name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          {card.card_name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{card.card_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{card.game}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-semibold inline-block",
                      getGradeColor(card.grade)
                    )}
                  >
                    {card.grade}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-semibold inline-block",
                      getLanguageColor(card.language)
                    )}
                  >
                    {card.language}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">${card.floor_price.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">${card.listing_price.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn("font-bold flex items-center justify-end gap-1", getROIColor(card.roi))}>
                    <TrendingUp className="h-4 w-4" />
                    {card.roi.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(card.ebay_url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

