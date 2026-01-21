"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface SaleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  average: number;
}

interface Props {
  data: SaleData[];
}

export default function PriceHistoryChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-muted-foreground">Aucune donnée disponible</div>;
  }

  const prices = data.map((d) => d.average).sort((a, b) => a - b);
  const median =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4">Historique des Prix</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <ReferenceLine
            y={median}
            stroke="hsl(var(--primary))"
            strokeDasharray="5 5"
            label={{ value: `Médiane: $${median.toFixed(2)}`, position: "top" }}
          />
          <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
