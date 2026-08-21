import crypto from "crypto";
import { sampleComplaints, samplePrices } from "@/data/mockData";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateId(): string {
  return crypto.randomBytes(12).toString("hex");
}

export interface ComplaintRow {
  id: string;
  caseRef: string;
  consumerName: string;
  email: string;
  phone: string | null;
  businessName: string;
  businessAddress: string | null;
  category: string;
  description: string;
  incidentDate: string | null;
  amount: number | null;
  dateFiled: string;
  status: string;
  assignedOfficer: string;
  notes: string; // JSON string array
  responseSummary: string;
}

export interface PriceEntryRow {
  id: string;
  product: string;
  supplier: string;
  surveyedPrice: number;
  controlledPrice: number;
  lastUpdated: string;
  category: string;
  unit: string;
  history: { month: string; surveyed: number }[];
}

export interface OfficerRow {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
}

function makeStore() {
  const complaints: ComplaintRow[] = sampleComplaints.map((c) => ({
    id: c.id,
    caseRef: c.caseRef,
    consumerName: c.consumerName,
    email: c.email,
    phone: c.phone ?? null,
    businessName: c.businessName,
    businessAddress: c.businessAddress ?? null,
    category: c.category,
    description: c.description,
    incidentDate: null,
    amount: null,
    dateFiled: c.dateFiled,
    status: c.status,
    assignedOfficer: c.assignedOfficer,
    notes: JSON.stringify(c.notes),
    responseSummary: c.responseSummary,
  }));

  const prices: PriceEntryRow[] = samplePrices.map((p) => ({
    id: p.id,
    product: p.product,
    supplier: p.supplier,
    surveyedPrice: p.surveyedPrice,
    controlledPrice: p.controlledPrice,
    lastUpdated: p.lastUpdated,
    category: p.category,
    unit: p.unit,
    history: p.history,
  }));

  const officers: OfficerRow[] = [
    { id: generateId(), username: "kwilliams", name: "Officer K. Williams", passwordHash: sha256("demo1234") },
    { id: generateId(), username: "rbaptiste", name: "Officer R. Baptiste", passwordHash: sha256("demo1234") },
    { id: generateId(), username: "jthomas", name: "Officer J. Thomas", passwordHash: sha256("demo1234") },
  ];

  return {
    complaints: {
      all: () => complaints,
      findById: (id: string) => complaints.find((c) => c.id === id),
      findByCaseRef: (ref: string) => complaints.find((c) => c.caseRef === ref.toUpperCase()),
      insert: (row: Omit<ComplaintRow, "id">) => {
        const entry: ComplaintRow = { id: generateId(), ...row };
        complaints.push(entry);
        return entry;
      },
      update: (
        id: string,
        patch: Partial<Pick<ComplaintRow, "status" | "assignedOfficer" | "responseSummary" | "notes">>
      ) => {
        const idx = complaints.findIndex((c) => c.id === id);
        if (idx === -1) return undefined;
        Object.assign(complaints[idx], patch);
        return complaints[idx];
      },
    },
    prices: {
      all: () => prices,
      insert: (row: Omit<PriceEntryRow, "id">) => {
        const entry: PriceEntryRow = { id: generateId(), ...row };
        prices.push(entry);
        return entry;
      },
    },
    officers: {
      findByUsername: (username: string) =>
        officers.find((o) => o.username === username.toLowerCase()),
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __store: ReturnType<typeof makeStore> | undefined;
}

export const store = globalThis.__store ?? makeStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__store = store;
}
