import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initDb } from "@/lib/init-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  initDb();

  const { ref } = await params;
  const rows = await db
    .select()
    .from(complaints)
    .where(eq(complaints.caseRef, ref.toUpperCase()))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const c = rows[0];
  return NextResponse.json({
    id: c.id,
    caseRef: c.caseRef,
    consumerName: c.consumerName,
    businessName: c.businessName,
    category: c.category,
    dateFiled: c.dateFiled,
    status: c.status,
    notes: JSON.parse(c.notes ?? "[]") as string[],
    responseSummary: c.responseSummary ?? "",
  });
}
