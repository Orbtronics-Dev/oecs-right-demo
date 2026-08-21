import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

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

  return NextResponse.json({ ...updated, notes: JSON.parse(updated.notes) });
}
