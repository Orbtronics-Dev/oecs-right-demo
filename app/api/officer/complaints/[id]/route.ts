import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { complaints } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initializeDatabase } from "@/lib/init-db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initializeDatabase();

  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, note, assignedOfficer, responseSummary } = body;

  const existing = await database
    .select()
    .from(complaints)
    .where(eq(complaints.id, id))
    .limit(1);

  if (!existing.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = existing[0];
  const currentNotes: string[] = JSON.parse(current.notes ?? "[]");
  if (note?.trim()) currentNotes.push(note.trim());

  await database
    .update(complaints)
    .set({
      ...(status ? { status } : {}),
      ...(assignedOfficer !== undefined ? { assignedOfficer } : {}),
      ...(responseSummary !== undefined ? { responseSummary } : {}),
      notes: JSON.stringify(currentNotes),
    })
    .where(eq(complaints.id, id));

  const updated = await database.select().from(complaints).where(eq(complaints.id, id)).limit(1);
  const c = updated[0];
  return NextResponse.json({ ...c, notes: JSON.parse(c.notes ?? "[]") });
}
