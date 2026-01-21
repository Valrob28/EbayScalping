"use client";

import { useState, useEffect } from "react";
import { Flame, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface Opportunity {
  id: number;
  card_name: string;
  card_set: string;
  language: string;
  grade: string;
  floor_price: number;
  listing_price: number;
  profit_margin: number;
  estimated_net_profit: number;
  volume_30d: number;
  ebay_url: string;
  image_url: string;
  trending: boolean;
}

export default function HotOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(
          `${FASTAPI_BACKEND_URL}/api/dashboard/hot-opportunities?limit=10&min_roi=15`
        );
        
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data);
        } else {
          setOpportunities(getMockOpportunities());
        }
      } catch (error) {
        console.error("Erreur hot opportunities:", error);
        setOpportunities(getMockOpportunities());
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">🔥 Hot Opportunities</h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune opportunité disponible
          </div>
        ) : (
          opportunities.slice(0, 5).map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))
        )}
      </div>

      {opportunities.length > 5 && (
        <Button variant="outline" className="w-full mt-4">
          Voir toutes les opportunités ({opportunities.length})
        </Button>
      )}
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-16 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
          {opportunity.image_url && opportunity.image_url.startsWith('http') ? (
            <Image
              src={opportunity.image_url}
              alt={opportunity.card_name}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              {opportunity.card_name.substring(0, 3)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{opportunity.card_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  {opportunity.grade}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  {opportunity.language}
                </span>
                {opportunity.trending && (
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Trending
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-green-500 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{opportunity.profit_margin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                ${opportunity.estimated_net_profit.toFixed(0)} profit
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Floor: </span>
                <span className="font-semibold">${opportunity.floor_price}</span>
              </div>
              <div>
                <span className="text-muted-foreground">List: </span>
                <span className="font-semibold text-green-500">
                  ${opportunity.listing_price}
                </span>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(opportunity.ebay_url, "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              eBay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockOpportunities(): Opportunity[] {
  return [
    {
      id: 1,
      card_name: "Charizard Base Set",
      card_set: "Base Set",
      language: "EN",
      grade: "PSA 10",
      floor_price: 450,
      listing_price: 320,
      profit_margin: 28.9,
      estimated_net_profit: 95,
      volume_30d: 15,
      ebay_url: "https://ebay.com/itm/123",
      image_url: "https://via.placeholder.com/64x80/FF6B6B/FFFFFF?text=Char",
      trending: true
    },
    {
      id: 2,
      card_name: "Pikachu Illustrator",
      card_set: "Promo",
      language: "JP",
      grade: "PSA 9",
      floor_price: 1200,
      listing_price: 850,
      profit_margin: 29.2,
      estimated_net_profit: 280,
      volume_30d: 3,
      ebay_url: "https://ebay.com/itm/456",
      image_url: "https://via.placeholder.com/64x80/4ECDC4/FFFFFF?text=Pika",
      trending: false
    },
    {
      id: 3,
      card_name: "Blastoise Base Set",
      card_set: "Base Set",
      language: "EN",
      grade: "PSA 10",
      floor_price: 280,
      listing_price: 195,
      profit_margin: 30.4,
      estimated_net_profit: 65,
      volume_30d: 22,
      ebay_url: "https://ebay.com/itm/789",
      image_url: "https://via.placeholder.com/64x80/95E1D3/FFFFFF?text=Blast",
      trending: true
    }
  ];
}
