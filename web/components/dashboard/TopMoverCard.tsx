"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface TopMoverCardProps {
  mover: {
    card_id: number;
    card_name: string;
    current_price: number;
    change_24h: number;
    volume_7d: number;
    trend: "up" | "down";
  };
}

export default function TopMoverCard({ mover }: TopMoverCardProps) {
  const isPositive = mover.change_24h > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{mover.card_name}</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xl font-bold">${mover.current_price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Volume: {mover.volume_7d}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 font-bold text-lg ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          {Math.abs(mover.change_24h).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
