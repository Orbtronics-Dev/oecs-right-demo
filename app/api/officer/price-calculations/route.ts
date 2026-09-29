import { NextRequest, NextResponse } from "next/server";
import { store, computeMrp } from "@/lib/store";
import { z } from "zod";

const insertSchema = z.object({
  importerName: z.string().min(1),
  productName: z.string().min(1),
  category: z.string().min(1),
  cifUsd: z.number().positive(),
  ecRate: z.number().positive(),
  duties: z.number().min(0),
  portCharges: z.number().min(0),
  variableCosts: z.number().min(0),
  wholesaleMarkupPct: z.number().min(0),
  retailMarkupPct: z.number().min(0),
});

export async function GET(req: NextRequest) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  return NextResponse.json(store.calculations.all());
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("officer_session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = insertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const calculatedMrp = computeMrp(
    data.cifUsd,
    data.ecRate,
    data.duties,
    data.portCharges,
    data.variableCosts,
    data.wholesaleMarkupPct,
    data.retailMarkupPct
  );

  const calculation = store.calculations.insert({
    importerName: data.importerName,
    productName: data.productName,
    category: data.category,
    cifUsd: data.cifUsd,
    ecRate: data.ecRate,
    duties: data.duties,
    portCharges: data.portCharges,
    variableCosts: data.variableCosts,
    wholesaleMarkupPct: data.wholesaleMarkupPct,
    retailMarkupPct: data.retailMarkupPct,
    calculatedMrp,
    stage: "submitted",
    submittedAt: new Date().toISOString(),
    verifiedAt: null,
    certifiedAt: null,
    approvedAt: null,
    officerNote: "",
  });

  return NextResponse.json(calculation, { status: 201 });
}
