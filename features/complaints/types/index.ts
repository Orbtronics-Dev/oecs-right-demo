export type CaseStatus = "Submitted" | "Under Review" | "Investigation" | "Resolved";

export interface Complaint {
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
  status: CaseStatus;
  assignedOfficer: string;
  notes: string[];
  responseSummary: string;
}

/** Subset returned to the public track endpoint — no PII. */
export interface ComplaintPublic {
  id: string;
  caseRef: string;
  consumerName: string;
  businessName: string;
  category: string;
  dateFiled: string;
  status: CaseStatus;
  notes: string[];
  responseSummary: string;
}

export interface ComplaintSubmission {
  businessName: string;
  businessAddress?: string;
  category: string;
  incidentDate?: string;
  amount?: string;
  description: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface ComplaintCreated {
  caseRef: string;
  dateFiled: string;
}
