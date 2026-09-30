import crypto from "crypto";
import {
  sampleComplaints,
  samplePrices,
  sampleCalculations,
  sampleMarkupParams,
  sampleAsycudaLog,
  sampleOutlets,
  sampleFeatureFlags,
  sampleAuditLog,
} from "@/data/mockData";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateId(): string {
  return crypto.randomBytes(12).toString("hex");
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

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
  outletId: string | null;
  breachStatus: "open" | "under_investigation" | "resolved" | null;
}

export type OfficerRole =
  | "field_officer"
  | "consumer_affairs_officer"
  | "senior_officer"
  | "director"
  | "customs_officer"
  | "oecs_executive";

export interface OfficerRow {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  role: OfficerRole;
}

export type CalcStage =
  | "submitted"
  | "officer_verified"
  | "senior_certified"
  | "director_approved";

export interface PriceCalculationRow {
  id: string;
  importerName: string;
  productName: string;
  category: string;
  cifUsd: number;
  ecRate: number;
  duties: number;
  portCharges: number;
  variableCosts: number;
  wholesaleMarkupPct: number;
  retailMarkupPct: number;
  calculatedMrp: number;
  stage: CalcStage;
  submittedAt: string;
  verifiedAt: string | null;
  certifiedAt: string | null;
  approvedAt: string | null;
  officerNote: string;
}

export interface MarkupParamRow {
  id: string;
  category: string;
  wholesalePct: number;
  retailPct: number;
  updatedAt: string;
}

export interface AsycudaSyncLogRow {
  id: string;
  triggeredAt: string;
  triggeredBy: string;
  status: "success" | "error" | "running";
  recordsProcessed: number;
  errors: number;
  notes: string;
}

export interface OutletRow {
  id: string;
  name: string;
  type: "supermarket" | "shop" | "pharmacy";
  zone: string;
  lastSurveyedAt: string | null;
}

export type FeatureFlag = "price_control_visible" | "asycuda_enabled";

export interface FeatureFlagRow {
  id: string;
  flag: FeatureFlag;
  enabled: boolean;
}

export interface AuditLogRow {
  id: string;
  tableName: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  rowId: string;
  changedBy: string;
  changedAt: string;
  description: string;
}

// ---------------------------------------------------------------------------
// MRP calculation helper
// ---------------------------------------------------------------------------

export function computeMrp(
  cifUsd: number,
  ecRate: number,
  duties: number,
  portCharges: number,
  variableCosts: number,
  wholesaleMarkupPct: number,
  retailMarkupPct: number
): number {
  const landedCost = cifUsd * ecRate + duties + portCharges + variableCosts;
  const mrp =
    landedCost * (1 + wholesaleMarkupPct / 100) * (1 + retailMarkupPct / 100);
  return Math.round(mrp * 100) / 100;
}

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

function makeStore() {
  const complaints: ComplaintRow[] = sampleComplaints.map((complaint) => ({
    id: complaint.id,
    caseRef: complaint.caseRef,
    consumerName: complaint.consumerName,
    email: complaint.email,
    phone: complaint.phone ?? null,
    businessName: complaint.businessName,
    businessAddress: complaint.businessAddress ?? null,
    category: complaint.category,
    description: complaint.description,
    incidentDate: null,
    amount: null,
    dateFiled: complaint.dateFiled,
    status: complaint.status,
    assignedOfficer: complaint.assignedOfficer,
    notes: JSON.stringify(complaint.notes),
    responseSummary: complaint.responseSummary,
  }));

  const prices: PriceEntryRow[] = samplePrices.map((price) => ({
    id: price.id,
    product: price.product,
    supplier: price.supplier,
    surveyedPrice: price.surveyedPrice,
    controlledPrice: price.controlledPrice,
    lastUpdated: price.lastUpdated,
    category: price.category,
    unit: price.unit,
    history: price.history,
    outletId: price.outletId ?? null,
    breachStatus: price.surveyedPrice > price.controlledPrice ? "open" : null,
  }));

  const officers: OfficerRow[] = [
    { id: generateId(), username: "kwilliams",  name: "K. Williams",  passwordHash: sha256("demo1234"), role: "consumer_affairs_officer" },
    { id: generateId(), username: "rbaptiste",  name: "R. Baptiste",  passwordHash: sha256("demo1234"), role: "field_officer" },
    { id: generateId(), username: "jthomas",    name: "J. Thomas",    passwordHash: sha256("demo1234"), role: "senior_officer" },
    { id: generateId(), username: "mdirector",  name: "M. Director",  passwordHash: sha256("demo1234"), role: "director" },
    { id: generateId(), username: "ccustoms",   name: "C. Customs",   passwordHash: sha256("demo1234"), role: "customs_officer" },
    { id: generateId(), username: "oexecutive", name: "O. Executive", passwordHash: sha256("demo1234"), role: "oecs_executive" },
  ];

  const calculations: PriceCalculationRow[] = sampleCalculations.map(
    (calculation) => ({ ...calculation, stage: calculation.stage as CalcStage })
  );

  const markupParams: MarkupParamRow[] = sampleMarkupParams.map(
    (markupParam) => ({ ...markupParam })
  );

  const asycudaLog: AsycudaSyncLogRow[] = sampleAsycudaLog.map(
    (logEntry) => ({ ...logEntry, status: logEntry.status as AsycudaSyncLogRow["status"] })
  );

  const outlets: OutletRow[] = sampleOutlets.map((outlet) => ({
    ...outlet,
    type: outlet.type as OutletRow["type"],
    lastSurveyedAt: outlet.lastSurveyedAt ?? null,
  }));

  const featureFlags: FeatureFlagRow[] = sampleFeatureFlags.map(
    (flagRow) => ({ ...flagRow, flag: flagRow.flag as FeatureFlag })
  );

  const auditLog: AuditLogRow[] = sampleAuditLog.map((entry) => ({ ...entry }));

  return {
    complaints: {
      all: () => complaints,
      findById: (id: string) => complaints.find((complaint) => complaint.id === id),
      findByCaseRef: (ref: string) =>
        complaints.find((complaint) => complaint.caseRef === ref.toUpperCase()),
      insert: (row: Omit<ComplaintRow, "id">) => {
        const entry: ComplaintRow = { id: generateId(), ...row };
        complaints.push(entry);
        return entry;
      },
      update: (
        id: string,
        patch: Partial<
          Pick<ComplaintRow, "status" | "assignedOfficer" | "responseSummary" | "notes">
        >
      ) => {
        const index = complaints.findIndex((complaint) => complaint.id === id);
        if (index === -1) return undefined;
        Object.assign(complaints[index], patch);
        return complaints[index];
      },
    },

    prices: {
      all: () => prices,
      findById: (id: string) => prices.find((price) => price.id === id),
      insert: (row: Omit<PriceEntryRow, "id">) => {
        const entry: PriceEntryRow = { id: generateId(), ...row };
        prices.push(entry);
        return entry;
      },
      updateBreach: (
        id: string,
        breachStatus: PriceEntryRow["breachStatus"]
      ) => {
        const index = prices.findIndex((price) => price.id === id);
        if (index === -1) return undefined;
        prices[index].breachStatus = breachStatus;
        return prices[index];
      },
    },

    officers: {
      findByUsername: (username: string) =>
        officers.find((officer) => officer.username === username.toLowerCase()),
      findById: (id: string) =>
        officers.find((officer) => officer.id === id),
    },

    calculations: {
      all: () => calculations,
      findById: (id: string) =>
        calculations.find((calculation) => calculation.id === id),
      insert: (row: Omit<PriceCalculationRow, "id">) => {
        const entry: PriceCalculationRow = { id: generateId(), ...row };
        calculations.push(entry);
        return entry;
      },
      advanceStage: (id: string, stage: CalcStage, note: string) => {
        const index = calculations.findIndex(
          (calculation) => calculation.id === id
        );
        if (index === -1) return undefined;
        const now = new Date().toISOString();
        calculations[index].stage = stage;
        if (note) calculations[index].officerNote = note;
        if (stage === "officer_verified") calculations[index].verifiedAt = now;
        if (stage === "senior_certified") calculations[index].certifiedAt = now;
        if (stage === "director_approved") calculations[index].approvedAt = now;
        return calculations[index];
      },
    },

    markupParams: {
      all: () => markupParams,
      findById: (id: string) =>
        markupParams.find((markupParam) => markupParam.id === id),
      findByCategory: (category: string) =>
        markupParams.find(
          (markupParam) =>
            markupParam.category.toLowerCase() === category.toLowerCase()
        ),
      update: (
        id: string,
        patch: Partial<Pick<MarkupParamRow, "wholesalePct" | "retailPct">>
      ) => {
        const index = markupParams.findIndex(
          (markupParam) => markupParam.id === id
        );
        if (index === -1) return undefined;
        Object.assign(markupParams[index], patch, {
          updatedAt: new Date().toISOString(),
        });
        return markupParams[index];
      },
    },

    asycudaLog: {
      all: () =>
        [...asycudaLog].sort((logA, logB) =>
          logB.triggeredAt.localeCompare(logA.triggeredAt)
        ),
      latest: () =>
        [...asycudaLog].sort((logA, logB) =>
          logB.triggeredAt.localeCompare(logA.triggeredAt)
        )[0] ?? null,
      insert: (row: Omit<AsycudaSyncLogRow, "id">) => {
        const entry: AsycudaSyncLogRow = { id: generateId(), ...row };
        asycudaLog.push(entry);
        return entry;
      },
      markComplete: (
        id: string,
        result: Pick<
          AsycudaSyncLogRow,
          "status" | "recordsProcessed" | "errors" | "notes"
        >
      ) => {
        const index = asycudaLog.findIndex((logEntry) => logEntry.id === id);
        if (index === -1) return undefined;
        Object.assign(asycudaLog[index], result);
        return asycudaLog[index];
      },
    },

    outlets: {
      all: () => outlets,
      findById: (id: string) => outlets.find((outlet) => outlet.id === id),
      updateLastSurveyed: (id: string) => {
        const index = outlets.findIndex((outlet) => outlet.id === id);
        if (index === -1) return undefined;
        outlets[index].lastSurveyedAt = new Date().toISOString().slice(0, 10);
        return outlets[index];
      },
    },

    featureFlags: {
      all: () => featureFlags,
      get: (flag: FeatureFlag) =>
        featureFlags.find((flagRow) => flagRow.flag === flag) ?? null,
      set: (flag: FeatureFlag, enabled: boolean) => {
        const index = featureFlags.findIndex(
          (flagRow) => flagRow.flag === flag
        );
        if (index === -1) return undefined;
        featureFlags[index].enabled = enabled;
        return featureFlags[index];
      },
    },

    auditLog: {
      all: () =>
        [...auditLog].sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
      insert: (row: Omit<AuditLogRow, "id">) => {
        const entry: AuditLogRow = { id: generateId(), ...row };
        auditLog.push(entry);
        return entry;
      },
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
