import type { Complaint } from "@/features/complaints/types";
import type { Officer } from "../types";

export async function officerSignIn(username: string, password: string): Promise<Officer> {
  const res = await fetch("/api/officer/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Sign in failed");
  }
  return res.json() as Promise<Officer>;
}

export async function officerSignOut(): Promise<void> {
  await fetch("/api/officer/auth", { method: "DELETE" });
}

export async function fetchOfficerComplaints(): Promise<Complaint[]> {
  const res = await fetch("/api/officer/complaints");
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json() as Promise<Complaint[]>;
}

export async function updateCase(
  id: string,
  patch: {
    status?: string;
    note?: string;
    assignedOfficer?: string;
    responseSummary?: string;
  }
): Promise<Complaint> {
  const res = await fetch(`/api/officer/complaints/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update case");
  return res.json() as Promise<Complaint>;
}
