"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  average: number;
}

interface PriceHistoryResponse {
  card_id: number;
  card_name: string;
  card_set: string;
  language: string;
  interval: string;
  days: number;
  data: PriceData[];
  total_sales: number;
  current_floor: number;
  highest_sale: number;
  lowest_sale: number;
  average_price: number;
}

type ChartType = "line" | "area" | "candlestick";
type Timeframe = "7d" | "30d" | "90d" | "1y";

interface PriceChartProps {
  cardId: number;
  defaultTimeframe?: Timeframe;
  showControls?: boolean;
}

export default function PriceChart({
  cardId,
  defaultTimeframe = "30d",
  showControls = true
}: PriceChartProps) {
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      try {
        const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365;
        const response = await fetch(
          `${FASTAPI_BACKEND_URL}/api/dashboard/price-history/${cardId}?days=${days}&interval=daily`
        );
        
        if (response.ok) {
          const historyData = await response.json();
          setData(historyData);
        } else {
          setData(getMockPriceHistory(cardId));
        }
      } catch (error) {
        console.error("Erreur price history:", error);
        setData(getMockPriceHistory(cardId));
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [cardId, timeframe]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-20 text-muted-foreground">
          Aucune donnée de prix disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {data.card_name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {data.card_set} • {data.language} • {data.total_sales} ventes
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            {/* Chart Type */}
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "candlestick" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("candlestick")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeframe */}
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as Timeframe)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatItem label="Prix Moyen" value={`$${data.average_price.toFixed(2)}`} />
        <StatItem label="Plancher" value={`$${data.current_floor.toFixed(2)}`} />
        <StatItem label="Plus Haut" value={`$${data.highest_sale.toFixed(2)}`} />
        <StatItem label="Plus Bas" value={`$${data.lowest_sale.toFixed(2)}`} />
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartType === "line" && <LineChartView data={data.data} />}
        {chartType === "area" && <AreaChartView data={data.data} />}
        {chartType === "candlestick" && <CandlestickChartView data={data.data} />}
      </div>
    </div>
  );
}

function LineChartView({ data }: { data: PriceData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Prix"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="close"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Prix de clôture"
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke="hsl(var(--chart-2))"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Moyenne"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaChartView({ data }: { data: PriceData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Prix"]}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CandlestickChartView({ data }: { data: PriceData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          content={<CandlestickTooltip />}
        />
        <Bar dataKey="high" fill="hsl(var(--chart-1))" name="High" />
        <Bar dataKey="low" fill="hsl(var(--chart-2))" name="Low" />
        <Bar dataKey="volume" fill="hsl(var(--chart-3))" name="Volume" yAxisId="right" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CandlestickTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{data.date}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Ouverture:</span>
            <span className="font-semibold">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Plus Haut:</span>
            <span className="font-semibold text-green-500">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Plus Bas:</span>
            <span className="font-semibold text-red-500">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Clôture:</span>
            <span className="font-semibold">${data.close.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-border">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-semibold">{data.volume}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
}

function getMockPriceHistory(cardId: number): PriceHistoryResponse {
  const data: PriceData[] = [];
  const basePrice = 250;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const variance = (Math.random() - 0.5) * 50;
    const open = basePrice + variance;
    const close = open + (Math.random() - 0.5) * 30;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 15;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.floor(Math.random() * 10) + 1,
      average: Math.round((high + low) / 2)
    });
  }

  return {
    card_id: cardId,
    card_name: "Charizard Base Set",
    card_set: "Base Set",
    language: "EN",
    interval: "daily",
    days: 30,
    data,
    total_sales: 45,
    current_floor: 220,
    highest_sale: 320,
    lowest_sale: 195,
    average_price: 250
  };
}
