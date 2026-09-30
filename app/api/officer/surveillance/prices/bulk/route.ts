import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { z } from "zod";

const rowSchema = z.object({
  product: z.string().min(1),
  unit: z.string().default("each"),
  surveyedPrice: z.number().positive(),
  controlledPrice: z.number().positive(),
  supplier: z.string().min(1),
  date: z.string().optional(),
  category: z.string().default("Food"),
  outletId: z.string().nullable().optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(200),
});

export async function POST(req: NextRequest) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const entries = parsed.data.rows.map((row) =>
    store.prices.insert({
      product: row.product,
      unit: row.unit,
      surveyedPrice: row.surveyedPrice,
      controlledPrice: row.controlledPrice,
      supplier: row.supplier,
      lastUpdated: row.date ?? today,
      category: row.category,
      history: [],
      outletId: row.outletId ?? null,
      breachStatus: row.surveyedPrice > row.controlledPrice ? "open" : null,
    })
  );

  return NextResponse.json({ inserted: entries.length, entries });
}
