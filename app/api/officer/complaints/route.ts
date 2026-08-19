import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/db";
import { complaints } from "@/lib/schema";
import { like, or, eq } from "drizzle-orm";
import { initializeDatabase } from "@/lib/init-db";

function requireOfficer(req: NextRequest) {
  return req.cookies.get("officer_session")?.value ?? null;
}

export async function GET(req: NextRequest) {
  initializeDatabase();

  if (!requireOfficer(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase() ?? "";
  const status = searchParams.get("status") ?? "";

  let rows = await database.select().from(complaints).orderBy(complaints.dateFiled);

  if (search) {
    rows = rows.filter(
      (c) =>
        c.caseRef.toLowerCase().includes(search) ||
        c.consumerName.toLowerCase().includes(search) ||
        c.businessName.toLowerCase().includes(search)
    );
  }
  if (status && status !== "All statuses") {
    rows = rows.filter((c) => c.status === status);
  }

  return NextResponse.json(
    rows.map((c) => ({
      ...c,
      notes: JSON.parse(c.notes ?? "[]") as string[],
    }))
  );
}
