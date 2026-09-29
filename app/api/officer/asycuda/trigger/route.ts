import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("officer_session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const logEntry = store.asycudaLog.insert({
    triggeredAt: new Date().toISOString(),
    triggeredBy: session,
    status: "running",
    recordsProcessed: 0,
    errors: 0,
    notes: "Manual sync triggered",
  });

  // Resolve to success after a short delay (in-process stub)
  setTimeout(() => {
    const recordsProcessed = Math.floor(Math.random() * 40) + 10;
    store.asycudaLog.markComplete(logEntry.id, {
      status: "success",
      recordsProcessed,
      errors: 0,
      notes: `Pulled ${recordsProcessed} import records from ASYCUDA World`,
    });
  }, 1500);

  return NextResponse.json(logEntry, { status: 202 });
}
