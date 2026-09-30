import type { OfficerRole } from "@/lib/store";

export type { OfficerRole };

export interface Officer {
  id: string;
  name: string;
  username: string;
  role: OfficerRole;
}

export const ROLE_LABELS: Record<OfficerRole, string> = {
  field_officer: "Field Officer",
  consumer_affairs_officer: "Consumer Affairs Officer",
  senior_officer: "Senior Officer",
  director: "Director",
  customs_officer: "Customs Officer",
  oecs_executive: "OECS Executive",
};

/** Tabs each role may access. */
export const ROLE_TABS: Record<OfficerRole, string[]> = {
  field_officer: ["surveillance"],
  consumer_affairs_officer: ["cases", "price-control", "surveillance"],
  senior_officer: ["cases", "price-control", "surveillance", "reports", "audit-log"],
  director: ["cases", "price-control", "surveillance", "asycuda", "reports", "audit-log", "settings"],
  customs_officer: ["asycuda"],
  oecs_executive: ["reports"],
};
