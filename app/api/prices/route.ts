import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";

  let result = store.prices.all();

  if (search) {
    result = result.filter(
      (e) =>
        e.product.toLowerCase().includes(search) ||
        e.supplier.toLowerCase().includes(search)
    );
  }
  if (category && category !== "All categories") {
    result = result.filter((e) => e.category === category);
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product, unit, surveyedPrice, controlledPrice, supplier, category, lastUpdated } = body;

  if (!product || !supplier || !surveyedPrice || !controlledPrice || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const parsedSurveyed = parseFloat(surveyedPrice);
  const parsedControlled = parseFloat(controlledPrice);
  const entry = store.prices.insert({
    product,
    supplier,
    surveyedPrice: parsedSurveyed,
    controlledPrice: parsedControlled,
    lastUpdated: lastUpdated ?? new Date().toISOString().slice(0, 10),
    category,
    unit: unit ?? "",
    history: [],
    outletId: null,
    breachStatus: parsedSurveyed > parsedControlled ? "open" : null,
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
