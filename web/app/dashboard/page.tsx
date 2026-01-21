"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketOverview from "./MarketOverview";
import HotOpportunities from "./HotOpportunities";
import TrendingCards from "./TrendingCards";
import StatCard from "./StatCard";
import { MarketStats } from "@/types";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FASTAPI_BACKEND_URL}/api/dashboard/market-overview`);
      if (res.ok) {
        const data = await res.json();
        setMarketStats(data);
      } else {
        setMarketStats(getMockMarketStats());
      }
      setLastRefresh(new Date());
    } catch {
      setMarketStats(getMockMarketStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !marketStats)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" /> TCG Market Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
            </p>
          </div>
          <Button onClick={fetchMarketData} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MarketOverview stats={marketStats!} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <HotOpportunities />
          <TrendingCards />
        </div>
      </div>
    </div>
  );
}

// Mock data
function getMockMarketStats(): MarketStats {
  return {
    total_cards: 1250,
    total_opportunities: 45,
    total_volume_24h: 12450,
    sales_24h: 23,
    top_movers: [
      { card_id: 1, card_name: "Charizard PSA 10", current_price: 4250, change_24h: 12.5, volume_7d: 15, trend: "up" },
      { card_id: 2, card_name: "Pikachu Illustrator PSA 9", current_price: 5500000, change_24h: 8.2, volume_7d: 2, trend: "up" },
      { card_id: 3, card_name: "Black Lotus Alpha PSA 9", current_price: 485000, change_24h: -2.1, volume_7d: 3, trend: "down" },
      { card_id: 4, card_name: "Blastoise PSA 10", current_price: 280, change_24h: 5.7, volume_7d: 22, trend: "up" },
      { card_id: 5, card_name: "Luffy Gear 5 Alt Art PSA 10", current_price: 180, change_24h: -1.2, volume_7d: 18, trend: "down" },
    ],
  };
}
