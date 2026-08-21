import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseReference: string }> }
) {
  const { caseReference } = await params;
  const complaint = store.complaints.findByCaseRef(caseReference);

  if (!complaint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: complaint.id,
    caseRef: complaint.caseRef,
    consumerName: complaint.consumerName,
    businessName: complaint.businessName,
    category: complaint.category,
    dateFiled: complaint.dateFiled,
    status: complaint.status,
    notes: JSON.parse(complaint.notes) as string[],
    responseSummary: complaint.responseSummary,
  });
}
