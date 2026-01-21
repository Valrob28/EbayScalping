"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface TrendingCard {
  card_id: number;
  card_name: string;
  card_set: string;
  language: string;
  sales_count: number;
  average_price: number;
  max_price: number;
  image_url: string;
}

type Timeframe = "24h" | "7d" | "30d";

export default function TrendingCards() {
  const [cards, setCards] = useState<TrendingCard[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingCards = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${FASTAPI_BACKEND_URL}/api/dashboard/trending-cards?limit=10&timeframe=${timeframe}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setCards(data.cards);
        } else {
          setCards(getMockTrendingCards());
        }
      } catch (error) {
        console.error("Erreur trending cards:", error);
        setCards(getMockTrendingCards());
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCards();
  }, [timeframe]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">📈 Trending Cards</h2>
        </div>
        
        <Select
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 heures</SelectItem>
            <SelectItem value="7d">7 jours</SelectItem>
            <SelectItem value="30d">30 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune carte tendance
          </div>
        ) : (
          cards.map((card, index) => (
            <TrendingCardItem key={card.card_id} card={card} rank={index + 1} />
          ))
        )}
      </div>
    </div>
  );
}

interface TrendingCardItemProps {
  card: TrendingCard;
  rank: number;
}

function TrendingCardItem({ card, rank }: TrendingCardItemProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20";
    if (rank === 2) return "bg-gray-400/20";
    if (rank === 3) return "bg-orange-600/20";
    return "bg-muted";
  };

  return (
    <div className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-8 h-8 rounded-full ${getRankBg(rank)} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-bold ${getRankColor(rank)}`}>
            #{rank}
          </span>
        </div>

        {/* Image */}
        <div className="relative w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
          {card.image_url && card.image_url.startsWith('http') ? (
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{card.card_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate">
              {card.card_set}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {card.language}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold">
            ${card.average_price.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Activity className="h-3 w-3" />
            {card.sales_count} ventes
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockTrendingCards(): TrendingCard[] {
  return [
    {
      card_id: 1,
      card_name: "Charizard Base Set",
      card_set: "Base Set",
      language: "EN",
      sales_count: 45,
      average_price: 425,
      max_price: 500,
      image_url: "https://via.placeholder.com/48x64/FF6B6B/FFFFFF?text=1"
    },
    {
      card_id: 2,
      card_name: "Pikachu Illustrator",
      card_set: "Promo",
      language: "JP",
      sales_count: 38,
      average_price: 5200000,
      max_price: 5500000,
      image_url: "https://via.placeholder.com/48x64/4ECDC4/FFFFFF?text=2"
    },
    {
      card_id: 3,
      card_name: "Blastoise Base Set",
      card_set: "Base Set",
      language: "EN",
      sales_count: 32,
      average_price: 265,
      max_price: 310,
      image_url: "https://via.placeholder.com/48x64/95E1D3/FFFFFF?text=3"
    },
    {
      card_id: 4,
      card_name: "Luffy Gear 5",
      card_set: "OP-01",
      language: "JP",
      sales_count: 28,
      average_price: 175,
      max_price: 200,
      image_url: "https://via.placeholder.com/48x64/AA96DA/FFFFFF?text=4"
    },
    {
      card_id: 5,
      card_name: "Blue-Eyes White Dragon",
      card_set: "LOB",
      language: "EN",
      sales_count: 25,
      average_price: 95,
      max_price: 120,
      image_url: "https://via.placeholder.com/48x64/FCBAD3/FFFFFF?text=5"
    }
  ];
}
