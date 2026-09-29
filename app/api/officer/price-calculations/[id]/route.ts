import { NextRequest, NextResponse } from "next/server";
import { store, CalcStage } from "@/lib/store";
import { z } from "zod";

const patchSchema = z.object({
  stage: z.enum(["officer_verified", "senior_certified", "director_approved"]),
  note: z.string().optional().default(""),
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

  const updated = store.calculations.advanceStage(
    id,
    parsed.data.stage as CalcStage,
    parsed.data.note
  );

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
