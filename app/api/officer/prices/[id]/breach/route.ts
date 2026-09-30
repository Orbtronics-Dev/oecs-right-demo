import { NextRequest, NextResponse } from "next/server";
import { store, PriceEntryRow } from "@/lib/store";
import { getOfficerFromRequest } from "@/lib/auth";
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

  const officer = getOfficerFromRequest(req);
  const statusLabel: Record<string, string> = {
    open: "Open",
    under_investigation: "Under Investigation",
    resolved: "Resolved",
  };
  store.auditLog.insert({
    tableName: "prices",
    operation: "UPDATE",
    rowId: id,
    changedBy: officer?.username ?? "unknown",
    changedAt: new Date().toISOString(),
    description: `Breach status for '${updated.product}' updated to '${statusLabel[parsed.data.breachStatus] ?? parsed.data.breachStatus}'`,
  });

  return NextResponse.json(updated);
}
