import type { NextRequest } from "next/server";
import { store } from "@/lib/store";
import type { OfficerRow } from "@/lib/store";

/**
 * Decode the officer_session cookie and return the matching OfficerRow,
 * or null if the cookie is missing or invalid.
 */
export function getOfficerFromRequest(req: NextRequest): OfficerRow | null {
  const cookie = req.cookies.get("officer_session")?.value;
  if (!cookie) return null;
  try {
    const decoded = Buffer.from(cookie, "base64").toString();
    const [officerId] = decoded.split(":");
    return store.officers.findById(officerId) ?? null;
  } catch {
    return null;
  }
}
