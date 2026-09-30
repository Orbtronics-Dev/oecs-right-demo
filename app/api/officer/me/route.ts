import { NextRequest, NextResponse } from "next/server";
import { getOfficerFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const officer = getOfficerFromRequest(req);
  if (!officer) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return NextResponse.json({
    id: officer.id,
    name: officer.name,
    username: officer.username,
    role: officer.role,
  });
}
