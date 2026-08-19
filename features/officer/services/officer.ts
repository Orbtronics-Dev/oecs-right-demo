import type { Complaint } from "@/features/complaints/types";
import type { Officer } from "../types";

export async function officerSignIn(username: string, password: string): Promise<Officer> {
  const response = await fetch("/api/officer/authentication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? "Sign in failed");
  }
  return response.json() as Promise<Officer>;
}

export async function officerSignOut(): Promise<void> {
  await fetch("/api/officer/authentication", { method: "DELETE" });
}

export async function fetchOfficerComplaints(): Promise<Complaint[]> {
  const response = await fetch("/api/officer/complaints");
  if (!response.ok) throw new Error("Failed to fetch cases");
  return response.json() as Promise<Complaint[]>;
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
  const response = await fetch(`/api/officer/complaints/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error("Failed to update case");
  return response.json() as Promise<Complaint>;
}
