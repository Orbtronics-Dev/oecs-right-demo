import { NextRequest, NextResponse } from "next/server";
import { store, FeatureFlag } from "@/lib/store";
import { z } from "zod";

const patchSchema = z.object({
  enabled: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ flag: string }> }
) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { flag } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = store.featureFlags.set(flag as FeatureFlag, parsed.data.enabled);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
