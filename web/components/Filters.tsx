"use client";

import { FilterState } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFiltersChange }: FiltersProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Filtres</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une carte..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Game */}
        <Select
          value={filters.game}
          onValueChange={(value) => updateFilter("game", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Jeu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les jeux</SelectItem>
            <SelectItem value="Pokémon">Pokémon</SelectItem>
            <SelectItem value="One Piece Card Game">One Piece</SelectItem>
            <SelectItem value="Yu-Gi-Oh!">Yu-Gi-Oh!</SelectItem>
          </SelectContent>
        </Select>

        {/* Grade */}
        <Select
          value={filters.grade}
          onValueChange={(value) => updateFilter("grade", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les grades</SelectItem>
            <SelectItem value="PSA 10">PSA 10</SelectItem>
            <SelectItem value="PSA 9">PSA 9</SelectItem>
            <SelectItem value="PSA 8">PSA 8</SelectItem>
            <SelectItem value="Raw">Raw</SelectItem>
          </SelectContent>
        </Select>

        {/* Language */}
        <Select
          value={filters.language}
          onValueChange={(value) => updateFilter("language", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les langues</SelectItem>
            <SelectItem value="EN">Anglais</SelectItem>
            <SelectItem value="FR">Français</SelectItem>
            <SelectItem value="JP">Japonais</SelectItem>
          </SelectContent>
        </Select>

        {/* Min ROI */}
        <div>
          <Input
            type="number"
            placeholder="ROI min (%)"
            value={filters.minROI || ""}
            onChange={(e) =>
              updateFilter("minROI", e.target.value ? Number(e.target.value) : 0)
            }
            min="0"
            step="0.1"
          />
        </div>

        {/* Max Price */}
        <div>
          <Input
            type="number"
            placeholder="Prix max ($)"
            value={filters.maxPrice === 10000 ? "" : filters.maxPrice}
            onChange={(e) =>
              updateFilter(
                "maxPrice",
                e.target.value ? Number(e.target.value) : 10000
              )
            }
            min="0"
            step="1"
          />
        </div>

        {/* Listing Type */}
        <Select
          value={filters.listingType}
          onValueChange={(value) => updateFilter("listingType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type de listing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="Buy Now">Achat immédiat</SelectItem>
            <SelectItem value="Auction">Enchères</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

