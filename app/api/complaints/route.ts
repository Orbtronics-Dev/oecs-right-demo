import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/lib/schema";
import { initDb } from "@/lib/init-db";
import crypto from "crypto";

function cuid() {
  return crypto.randomBytes(12).toString("hex");
}

function generateCaseRef(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 89999) + 10001).padStart(5, "0");
  return `CP-${year}-${seq}`;
}

export async function POST(req: NextRequest) {
  initDb();

  const body = await req.json();
  const { businessName, businessAddress, category, description, incidentDate, amount, fullName, email, phone } = body;

  if (!businessName || !category || !description || !fullName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = cuid();
  const caseRef = generateCaseRef();
  const dateFiled = new Date().toISOString().slice(0, 10);

  await db.insert(complaints).values({
    id,
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

  return NextResponse.json({ caseRef, dateFiled }, { status: 201 });
}
