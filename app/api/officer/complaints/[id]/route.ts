import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getOfficerFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, note, assignedOfficer, responseSummary } = body;

  const current = store.complaints.findById(id);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currentNotes: string[] = JSON.parse(current.notes);
  if (note?.trim()) currentNotes.push(note.trim());

  const updated = store.complaints.update(id, {
    ...(status ? { status } : {}),
    ...(assignedOfficer !== undefined ? { assignedOfficer } : {}),
    ...(responseSummary !== undefined ? { responseSummary } : {}),
    notes: JSON.stringify(currentNotes),
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const officer = getOfficerFromRequest(req);
  const parts: string[] = [];
  if (status) parts.push(`status → '${status}'`);
  if (assignedOfficer !== undefined) parts.push(`assigned officer → '${assignedOfficer || "unassigned"}'`);
  if (parts.length > 0) {
    store.auditLog.insert({
      tableName: "complaints",
      operation: "UPDATE",
      rowId: id,
      changedBy: officer?.username ?? "unknown",
      changedAt: new Date().toISOString(),
      description: `Complaint ${updated.caseRef} updated: ${parts.join(", ")}`,
    });
  }

  return NextResponse.json({ ...updated, notes: JSON.parse(updated.notes) });
}
