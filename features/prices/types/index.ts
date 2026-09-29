export interface PriceHistoryPoint {
  month: string;
  surveyed: number;
}

export interface PriceEntry {
  id: string;
  product: string;
  supplier: string;
  surveyedPrice: number;
  controlledPrice: number;
  lastUpdated: string;
  category: string;
  unit: string;
  history: PriceHistoryPoint[];
  outletId: string | null;
  breachStatus: "open" | "under_investigation" | "resolved" | null;
}

export interface PriceSubmission {
  product: string;
  unit?: string;
  surveyedPrice: number;
  controlledPrice: number;
  supplier: string;
  category: string;
  lastUpdated?: string;
}
