"use client";

import { useState, useEffect } from "react";
import MarketplaceView from "@/components/MarketplaceView";
import Filters from "@/components/Filters";
import { CardData, FilterState } from "@/types";

export default function Home() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    game: "all",
    search: "",
    grade: "all",
    language: "all",
    minROI: 0,
    maxPrice: 10000,
    listingType: "all",
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch data from API
  const fetchCards = async () => {
    try {
      const response = await fetch("/api/opportunities");
      const data = await response.json();
      setCards(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching cards:", error);
      // Fallback to mock data if API not available
      setCards(mockCards);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCards();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCards();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...cards];

    if (filters.game !== "all") {
      filtered = filtered.filter((card) => card.game === filters.game);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.card_name.toLowerCase().includes(searchLower) ||
          card.card_name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.grade !== "all") {
      filtered = filtered.filter((card) => card.grade === filters.grade);
    }

    if (filters.language !== "all") {
      filtered = filtered.filter((card) => card.language === filters.language);
    }

    if (filters.minROI > 0) {
      filtered = filtered.filter((card) => card.roi >= filters.minROI);
    }

    if (filters.maxPrice < 10000) {
      filtered = filtered.filter((card) => card.listing_price <= filters.maxPrice);
    }

    if (filters.listingType !== "all") {
      // This would require additional data from API
      // For now, we'll skip this filter
    }

    setFilteredCards(filtered);
  }, [cards, filters]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Cards Arbitrage</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour: {lastRefresh.toLocaleTimeString("fr-FR")}
          </p>
        </div>

        <Filters filters={filters} onFiltersChange={setFilters} />

        <MarketplaceView
          cards={filteredCards}
          loading={loading}
          onRefresh={fetchCards}
        />
      </div>
    </main>
  );
}

// Mock data for development
const mockCards: CardData[] = [
  {
    id: 1,
    card_name: "Charizard Base Set",
    game: "Pokémon",
    image_url: "https://via.placeholder.com/200x280",
    floor_price: 450.0,
    listing_price: 320.0,
    roi: 28.9,
    language: "EN",
    grade: "PSA 10",
    ebay_url: "https://ebay.com/itm/123",
    sales_history: [],
  },
  {
    id: 2,
    card_name: "Pikachu Illustrator",
    game: "Pokémon",
    image_url: "https://via.placeholder.com/200x280",
    floor_price: 1200.0,
    listing_price: 850.0,
    roi: 29.2,
    language: "JP",
    grade: "PSA 9",
    ebay_url: "https://ebay.com/itm/456",
    sales_history: [],
  },
];

