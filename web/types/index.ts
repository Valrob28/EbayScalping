export type Game = "Pokémon" | "One Piece Card Game" | "Yu-Gi-Oh!" | "all";
export type Grade = "PSA 8" | "PSA 9" | "PSA 10" | "Raw" | "all";
export type Language = "FR" | "EN" | "JP" | "all";
export type ListingType = "Auction" | "Buy Now" | "all";

export interface FilterState {
  game: Game;
  search: string;
  grade: Grade;
  language: Language;
  minROI: number;
  maxPrice: number;
  listingType: ListingType;
}

export interface SaleHistory {
  date: string;
  price: number;
}

export interface CardData {
  id: number;
  card_name: string;
  game: string;
  image_url: string;
  floor_price: number;
  listing_price: number;
  roi: number;
  language: string;
  grade: string;
  ebay_url: string;
  sales_history: SaleHistory[];
}

