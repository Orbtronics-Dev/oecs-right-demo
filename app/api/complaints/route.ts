import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

function generateCaseRef(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 89999) + 10001).padStart(5, "0");
  return `CP-${year}-${seq}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessName, businessAddress, category, description, incidentDate, amount, fullName, email, phone } = body;

  if (!businessName || !category || !description || !fullName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const caseRef = generateCaseRef();
  const dateFiled = new Date().toISOString().slice(0, 10);

  const complaint = store.complaints.insert({
    caseRef,
    consumerName: fullName,
    email,
    phone: phone ?? null,
    businessName,
    businessAddress: businessAddress ?? null,
    category,
    description,
    incidentDate: incidentDate ?? null,
    amount: amount ? parseFloat(amount) : null,
    dateFiled,
    status: "Submitted",
    assignedOfficer: "",
    notes: "[]",
    responseSummary: "",
  });

  return NextResponse.json({ caseRef: complaint.caseRef, dateFiled: complaint.dateFiled }, { status: 201 });
}
