"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { SaleData } from "@/types";

interface PriceHistoryChartProps {
  data: SaleData[];
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const chartData = data.map((s) => ({
    date: s.date,
    open: s.price,
    high: s.price,
    low: s.price,
    close: s.price,
    volume: s.quantity ?? 1,
    average: s.price,
  }));

  const median =
    chartData.length > 0
      ? chartData
          .map((d) => d.close)
          .sort((a, b) => a - b)[Math.floor(chartData.length / 2)]
      : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <ReferenceLine
          y={median}
          stroke="hsl(var(--primary))"
          strokeDasharray="5 5"
          label={{ value: `Médiane: $$
