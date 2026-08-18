import type { PriceEntry, PriceSubmission } from "../types";

export async function fetchPrices(params?: {
  q?: string;
  category?: string;
}): Promise<PriceEntry[]> {
  const url = new URL("/api/prices", window.location.origin);
  if (params?.q) url.searchParams.set("q", params.q);
  if (params?.category && params.category !== "All categories")
    url.searchParams.set("category", params.category);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch prices");
  return res.json() as Promise<PriceEntry[]>;
}

export async function addPriceEntry(data: PriceSubmission): Promise<{ id: string }> {
  const res = await fetch("/api/prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save price entry");
  return res.json() as Promise<{ id: string }>;
}
