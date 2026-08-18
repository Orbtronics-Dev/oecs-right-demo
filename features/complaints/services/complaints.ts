import type { ComplaintPublic, ComplaintSubmission, ComplaintCreated } from "../types";

export async function submitComplaint(data: ComplaintSubmission): Promise<ComplaintCreated> {
  const res = await fetch("/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Failed to submit complaint");
  }
  return res.json() as Promise<ComplaintCreated>;
}

export async function lookupComplaint(ref: string): Promise<ComplaintPublic> {
  const res = await fetch(`/api/complaints/${encodeURIComponent(ref.trim().toUpperCase())}`);
  if (res.status === 404) {
    const err = new Error("NOT_FOUND");
    err.name = "NOT_FOUND";
    throw err;
  }
  if (!res.ok) throw new Error("Lookup failed");
  return res.json() as Promise<ComplaintPublic>;
}
