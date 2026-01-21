"use client";

import { useState, useEffect } from "react";
import { Globe, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface MarketStatsData {
  total_cards: number;
  total_sales: number;
  total_listings: number;
  total_volume: number;
  volume_24h: number;
  volume_7d: number;
  volume_30d: number;
  average_by_language: Array<{
    language: string;
    average_price: number;
    sales_count: number;
  }>;
}

export default function MarketOverview() {
  const [stats, setStats] = useState<MarketStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const response = await fetch(`${FASTAPI_BACKEND_URL}/api/dashboard/market-stats`);
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setStats(getMockMarketStats());
        }
      } catch (error) {
        console.error("Erreur market stats:", error);
        setStats(getMockMarketStats());
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculer les variations
  const change24h = stats.volume_24h;
  const change7d = stats.volume_7d - change24h;
  const changePercent24h = ((change24h / (stats.volume_7d - change24h)) * 100) || 0;

  // Données pour le graphique par langue
  const languageData = stats.average_by_language.map(lang => ({
    name: getLanguageName(lang.language),
    value: lang.sales_count,
    average: lang.average_price
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      {/* Volume Global */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Vue d'Ensemble du Marché</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Volume Total */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Volume Total</span>
            </div>
            <div className="text-3xl font-bold">
              ${stats.total_volume.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.total_sales.toLocaleString()} ventes
            </div>
          </div>

          {/* Volume 24h */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Volume 24h</span>
            </div>
            <div className="text-3xl font-bold">
              ${stats.volume_24h.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              changePercent24h >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              {changePercent24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(changePercent24h).toFixed(2)}%
            </div>
          </div>

          {/* Volume 7d */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Volume 7 jours</span>
            </div>
            <div className="text-3xl font-bold">
              ${stats.volume_7d.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Moyenne: ${(stats.volume_7d / 7).toFixed(0)}/jour
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par Langue */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-6">Répartition par Langue</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats détaillées */}
          <div className="space-y-4">
            {stats.average_by_language.map((lang, index) => (
              <LanguageStatCard
                key={lang.language}
                language={lang.language}
                averagePrice={lang.average_price}
                salesCount={lang.sales_count}
                color={COLORS[index % COLORS.length]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Métriques Additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Cartes Actives"
          value={stats.total_cards.toLocaleString()}
          subtext="Dans la base de données"
        />
        <MetricCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Listings Actifs"
          value={stats.total_listings.toLocaleString()}
          subtext="En vente actuellement"
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Volume 30j"
          value={`$${stats.volume_30d.toLocaleString()}`}
          subtext={`${Math.round(stats.volume_30d / stats.total_volume * 100)}% du total`}
        />
      </div>
    </div>
  );
}

interface LanguageStatCardProps {
  language: string;
  averagePrice: number;
  salesCount: number;
  color: string;
}

function LanguageStatCard({ language, averagePrice, salesCount, color }: LanguageStatCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <div className="font-semibold">{getLanguageName(language)}</div>
        <div className="text-sm text-muted-foreground">
          {salesCount} ventes • Moy. ${averagePrice.toFixed(2)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">${averagePrice.toFixed(0)}</div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}

function MetricCard({ icon, label, value, subtext }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 text-primary mb-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{subtext}</div>
    </div>
  );
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    EN: "Anglais",
    FR: "Français",
    JP: "Japonais",
    DE: "Allemand",
    ES: "Espagnol",
    IT: "Italien"
  };
  return names[code] || code;
}

function getMockMarketStats(): MarketStatsData {
  return {
    total_cards: 1250,
    total_sales: 4567,
    total_listings: 234,
    total_volume: 1250000,
    volume_24h: 12450.50,
    volume_7d: 85000,
    volume_30d: 350000,
    average_by_language: [
      { language: "EN", average_price: 285.50, sales_count: 2800 },
      { language: "JP", average_price: 425.75, sales_count: 1200 },
      { language: "FR", average_price: 195.25, sales_count: 450 },
      { language: "DE", average_price: 210.00, sales_count: 117 }
    ]
  };
}
