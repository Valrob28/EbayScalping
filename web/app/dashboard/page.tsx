"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  DollarSign,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import HotOpportunities from "@/components/dashboard/HotOpportunities";
import TrendingCards from "@/components/dashboard/TrendingCards";

const FASTAPI_BACKEND_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

/* =======================
   Types
======================= */

interface TopMover {
  card_id: number;
  card_name: string;
  current_price: number;
  change_24h: number;
  volume_7d: number;
  trend: "up" | "down";
}

interface MarketStats {
  total_cards: number;
  total_opportunities: number;
  total_volume_24h: number;
  sales_24h: number;
  top_movers: TopMover[];
}

/* =======================
   Page
======================= */

export default function DashboardPage() {
  const [data, setData] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${FASTAPI_BACKEND_URL}/dashboard/market-overview`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Backend indisponible");

      const json = await res.json();
      setData(json);
    } catch {
      setData(getMockMarketStats());
    } finally {
      setLastRefresh(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              TCG Market Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour :{" "}
              {lastRefresh.toLocaleTimeString("fr-FR")}
            </p>
          </div>

          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Target />}
            label="Cartes suivies"
            value={data.total_cards}
            color="text-blue-500"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Opportunités actives"
            value={data.total_opportunities}
            color="text-green-500"
          />
          <StatCard
            icon={<DollarSign />}
            label="Volume 24h"
            value={`$${data.total_volume_24h.toLocaleString()}`}
            color="text-purple-500"
          />
          <StatCard
            icon={<Activity />}
            label="Ventes 24h"
            value={data.sales_24h}
            color="text-orange-500"
          />
        </section>

        {/* Top Movers */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Movers (7 jours)
          </h2>

          <div className="grid gap-3">
            {data.top_movers.slice(0, 5).map((m) => (
              <TopMoverCard key={m.card_id} mover={m} />
            ))}
          </div>
        </section>

        {/* Lists */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HotOpportunities />
          <TrendingCards />
        </section>
      </main>
    </div>
  );
}

/* =======================
   Components
======================= */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TopMoverCard({ mover }: { mover: TopMover }) {
  const positive = mover.change_24h > 0;

  return (
    <div className="bg-card border rounded-lg p-4 flex justify-between items-center">
      <div>
        <div className="font-semibold text-lg">{mover.card_name}</div>
        <div className="text-sm text-muted-foreground">
          ${mover.current_price.toLocaleString()} • Volume {mover.volume_7d}
        </div>
      </div>

      <div
        className={`flex items-center gap-1 font-bold ${
          positive ? "text-green-500" : "text-red-500"
        }`}
      >
        {positive ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}
        {Math.abs(mover.change_24h).toFixed(2)}%
      </div>
    </div>
  );
}

/* =======================
   Mock
======================= */

function getMockMarketStats(): MarketStats {
  return {
    total_cards: 1250,
    total_opportunities: 45,
    total_volume_24h: 12450.5,
    sales_24h: 23,
    top_movers: [
      {
        card_id: 1,
        card_name: "Charizard Base Set PSA 10",
        current_price: 4250,
        change_24h: 12.5,
        volume_7d: 15,
        trend: "up",
      },
      {
        card_id: 2,
        card_name: "Pikachu Illustrator PSA 9",
        current_price: 5_500_000,
        change_24h: 8.2,
        volume_7d: 2,
        trend: "up",
      },
      {
        card_id: 3,
        card_name: "Black Lotus Alpha PSA 9",
        current_price: 485_000,
        change_24h: -2.1,
        volume_7d: 3,
        trend: "down",
      },
    ],
  };
}
