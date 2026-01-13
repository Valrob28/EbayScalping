import { NextResponse } from "next/server";

const FASTAPI_BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    
    // Fetch card details from backend
    const response = await fetch(`${FASTAPI_BACKEND_URL}/api/cards/${cardId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Card not found");
    }

    const card = await response.json();
    
    // Fetch sales history
    const salesResponse = await fetch(
      `${FASTAPI_BACKEND_URL}/api/cards/${cardId}/sales`,
      { next: { revalidate: 60 } }
    );

    let salesHistory: Array<{ date: string; price: number }> = [];
    if (salesResponse.ok) {
      const sales = await salesResponse.json();
      salesHistory = sales.map((sale: any) => ({
        date: sale.sold_date,
        price: sale.price,
      }));
    }

    return NextResponse.json({
      ...card,
      sales_history: salesHistory,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch card details" },
      { status: 500 }
    );
  }
}

