import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { priceEntries, pricePoints } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initDb } from "@/lib/init-db";

export async function GET(req: NextRequest) {
  initDb();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";

  const entries = await db.select().from(priceEntries);
  const points = await db.select().from(pricePoints);

  const pointsByEntry = new Map<string, { month: string; surveyed: number }[]>();
  for (const p of points) {
    const list = pointsByEntry.get(p.priceEntryId) ?? [];
    list.push({ month: p.month, surveyed: p.surveyed });
    pointsByEntry.set(p.priceEntryId, list);
  }

  let result = entries.map((e) => ({
    id: e.id,
    product: e.product,
    supplier: e.supplier,
    surveyedPrice: e.surveyedPrice,
    controlledPrice: e.controlledPrice,
    lastUpdated: e.lastUpdated,
    category: e.category,
    unit: e.unit,
    history: pointsByEntry.get(e.id) ?? [],
  }));

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
  initDb();

  // Officer-only: add a new price survey entry
  const body = await req.json();
  const { product, unit, surveyedPrice, controlledPrice, supplier, category, lastUpdated } = body;

  if (!product || !supplier || !surveyedPrice || !controlledPrice || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = Math.random().toString(36).slice(2);
  await db.insert(priceEntries).values({
    id,
    product,
    supplier,
    surveyedPrice: parseFloat(surveyedPrice),
    controlledPrice: parseFloat(controlledPrice),
    lastUpdated: lastUpdated ?? new Date().toISOString().slice(0, 10),
    category,
    unit: unit ?? "",
  });

  return NextResponse.json({ id }, { status: 201 });
}
