import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { complaints } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initializeDatabase } from "@/lib/init-db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseReference: string }> }
) {
  initializeDatabase();

  const { caseReference } = await params;
  const rows = await database
    .select()
    .from(complaints)
    .where(eq(complaints.caseRef, caseReference.toUpperCase()))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const complaint = rows[0];
  return NextResponse.json({
    id: complaint.id,
    caseRef: complaint.caseRef,
    consumerName: complaint.consumerName,
    businessName: complaint.businessName,
    category: complaint.category,
    dateFiled: complaint.dateFiled,
    status: complaint.status,
    notes: JSON.parse(complaint.notes ?? "[]") as string[],
    responseSummary: complaint.responseSummary ?? "",
  });
}
