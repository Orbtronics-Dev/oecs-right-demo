import { NextRequest, NextResponse } from "next/server";
import { store, PriceEntryRow } from "@/lib/store";
import { z } from "zod";

const patchSchema = z.object({
  breachStatus: z.enum(["open", "under_investigation", "resolved"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = store.prices.updateBreach(
    id,
    parsed.data.breachStatus as PriceEntryRow["breachStatus"]
  );

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
