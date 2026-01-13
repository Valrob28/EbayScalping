import { NextResponse } from "next/server";
import { CardData } from "@/types";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export async function GET() {
  try {
    // Try to fetch from FastAPI backend
    const response = await fetch(`${FASTAPI_BACKEND_URL}/api/opportunities?active_only=true`, {
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    if (!response.ok) {
      throw new Error("Backend not available");
    }

    const data = await response.json();
    
    // Transform backend data to frontend format
    const opportunities: CardData[] = data.map((opp: any) => ({
      id: opp.id,
      card_name: opp.card?.normalized_name || "Unknown Card",
      game: "Pokémon", // Default, should come from backend
      image_url: opp.listing?.listing_url 
        ? `https://i.ebayimg.com/images/g/${opp.listing.ebay_item_id}/s-l500.jpg`
        : "https://via.placeholder.com/200x280",
      floor_price: opp.floor_price,
      listing_price: opp.listing_price,
      roi: opp.profit_margin,
      language: opp.card?.language || "EN",
      grade: opp.listing?.psa_grade || "Raw",
      ebay_url: opp.listing?.listing_url || `https://ebay.com/itm/${opp.listing?.ebay_item_id}`,
      sales_history: [], // Would need separate API call
    }));

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Error fetching from backend, using mock data:", error);
    
    // Return mock data if backend is not available
    return NextResponse.json(getMockOpportunities());
  }
}

function getMockOpportunities(): CardData[] {
  const now = new Date();
  
  return [
    {
      id: 1,
      card_name: "Charizard Base Set",
      game: "Pokémon",
      image_url: "https://via.placeholder.com/200x280/FF6B6B/FFFFFF?text=Charizard",
      floor_price: 450.0,
      listing_price: 320.0,
      roi: 28.9,
      language: "EN",
      grade: "PSA 10",
      ebay_url: "https://ebay.com/itm/123",
      sales_history: generateMockSalesHistory(450, 30),
    },
    {
      id: 2,
      card_name: "Pikachu Illustrator",
      game: "Pokémon",
      image_url: "https://via.placeholder.com/200x280/4ECDC4/FFFFFF?text=Pikachu",
      floor_price: 1200.0,
      listing_price: 850.0,
      roi: 29.2,
      language: "JP",
      grade: "PSA 9",
      ebay_url: "https://ebay.com/itm/456",
      sales_history: generateMockSalesHistory(1200, 30),
    },
    {
      id: 3,
      card_name: "Blastoise Base Set",
      game: "Pokémon",
      image_url: "https://via.placeholder.com/200x280/95E1D3/FFFFFF?text=Blastoise",
      floor_price: 280.0,
      listing_price: 195.0,
      roi: 30.4,
      language: "EN",
      grade: "PSA 10",
      ebay_url: "https://ebay.com/itm/789",
      sales_history: generateMockSalesHistory(280, 30),
    },
    {
      id: 4,
      card_name: "Venusaur Base Set",
      game: "Pokémon",
      image_url: "https://via.placeholder.com/200x280/F38181/FFFFFF?text=Venusaur",
      floor_price: 320.0,
      listing_price: 240.0,
      roi: 25.0,
      language: "EN",
      grade: "PSA 9",
      ebay_url: "https://ebay.com/itm/101",
      sales_history: generateMockSalesHistory(320, 30),
    },
    {
      id: 5,
      card_name: "Luffy Gear 5",
      game: "One Piece Card Game",
      image_url: "https://via.placeholder.com/200x280/AA96DA/FFFFFF?text=Luffy",
      floor_price: 180.0,
      listing_price: 125.0,
      roi: 30.6,
      language: "JP",
      grade: "PSA 10",
      ebay_url: "https://ebay.com/itm/202",
      sales_history: generateMockSalesHistory(180, 30),
    },
    {
      id: 6,
      card_name: "Blue-Eyes White Dragon",
      game: "Yu-Gi-Oh!",
      image_url: "https://via.placeholder.com/200x280/FCBAD3/FFFFFF?text=Blue-Eyes",
      floor_price: 95.0,
      listing_price: 68.0,
      roi: 28.4,
      language: "EN",
      grade: "PSA 9",
      ebay_url: "https://ebay.com/itm/303",
      sales_history: generateMockSalesHistory(95, 30),
    },
  ];
}

function generateMockSalesHistory(floorPrice: number, days: number): Array<{ date: string; price: number }> {
  const history = [];
  const basePrice = floorPrice * 0.85;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 0.3;
    const price = Math.max(basePrice * (1 + variation), floorPrice * 0.7);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
    });
  }
  
  return history;
}

