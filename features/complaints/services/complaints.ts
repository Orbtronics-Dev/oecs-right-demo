import type { ComplaintPublic, ComplaintSubmission, ComplaintCreated } from "../types";

export async function submitComplaint(data: ComplaintSubmission): Promise<ComplaintCreated> {
  const response = await fetch("/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? "Failed to submit complaint");
  }
  return response.json() as Promise<ComplaintCreated>;
}

export async function lookupComplaint(caseReference: string): Promise<ComplaintPublic> {
  const response = await fetch(`/api/complaints/${encodeURIComponent(caseReference.trim().toUpperCase())}`);
  if (response.status === 404) {
    const notFoundError = new Error("NOT_FOUND");
    notFoundError.name = "NOT_FOUND";
    throw notFoundError;
  }
  if (!response.ok) throw new Error("Lookup failed");
  return response.json() as Promise<ComplaintPublic>;
}
