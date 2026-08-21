import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import crypto from "crypto";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const officer = store.officers.findByUsername(username);

  if (!officer || officer.passwordHash !== sha256(password)) {
    return NextResponse.json({ error: "Invalid officer ID or password" }, { status: 401 });
  }

  // Simple session token: base64 of officer id + timestamp, stored in a cookie.
  // Not cryptographically signed - this is a demo. Replace with proper JWT in production.
  const token = Buffer.from(`${officer.id}:${Date.now()}`).toString("base64");

  const response = NextResponse.json({
    id: officer.id,
    name: officer.name,
    username: officer.username,
  });

  response.cookies.set("officer_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("officer_session");
  return response;
}
