"use client";

import { SaleHistory } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PriceHistoryChartProps {
  data: SaleHistory[];
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  // Transform data for Recharts
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    }),
    price: Number(item.price.toFixed(2)),
    fullDate: item.date,
  }));

  // Calculate median
  const prices = data.map((d) => d.price);
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const median =
    sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] +
          sortedPrices[sortedPrices.length / 2]) /
        2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
          domain={["auto", "auto"]}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Prix"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <ReferenceLine
          y={median}
          stroke="hsl(var(--primary))"
          strokeDasharray="5 5"
          label={{ value: `Médiane: $${median.toFixed(2)}`, position: "topRight" }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(var(--primary))" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

