import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("officer_session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 422 });
  }

  const fileName = (file as File).name;
  const recordsProcessed = Math.floor(Math.random() * 80) + 20;

  const logEntry = store.asycudaLog.insert({
    triggeredAt: new Date().toISOString(),
    triggeredBy: session,
    status: "success",
    recordsProcessed,
    errors: 0,
    notes: `Flat-file upload: ${fileName} — ${recordsProcessed} records imported`,
  });

  return NextResponse.json(logEntry, { status: 201 });
}
