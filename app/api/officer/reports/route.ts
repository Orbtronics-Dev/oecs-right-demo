import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!req.cookies.get("officer_session")?.value) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const allComplaints = store.complaints.all();
  const allPrices = store.prices.all();
  const allCalculations = store.calculations.all();

  // Complaints by status
  const statusCounts: Record<string, number> = {};
  for (const complaint of allComplaints) {
    statusCounts[complaint.status] = (statusCounts[complaint.status] ?? 0) + 1;
  }
  const complaintsByStatus = Object.entries(statusCounts).map(
    ([status, count]) => ({ status, count })
  );

  // Complaints by category
  const categoryCounts: Record<string, number> = {};
  for (const complaint of allComplaints) {
    categoryCounts[complaint.category] = (categoryCounts[complaint.category] ?? 0) + 1;
  }
  const complaintsByCategory = Object.entries(categoryCounts).map(
    ([category, count]) => ({ category, count })
  );

  // Price breach summary
  const totalPrices = allPrices.length;
  const overLimit = allPrices.filter(
    (price) => price.surveyedPrice > price.controlledPrice
  ).length;
  const pricesBreach = {
    total: totalPrices,
    overLimit,
    pct: totalPrices > 0 ? Math.round((overLimit / totalPrices) * 100) : 0,
  };

  // Calculations by stage
  const stageCounts: Record<string, number> = {};
  for (const calculation of allCalculations) {
    stageCounts[calculation.stage] = (stageCounts[calculation.stage] ?? 0) + 1;
  }
  const calculationsByStage = Object.entries(stageCounts).map(
    ([stage, count]) => ({ stage, count })
  );

  // Resolution times — static representative data (no timestamp on resolution in demo)
  const resolutionTimes = [
    { month: "Apr", days: 14 },
    { month: "May", days: 11 },
    { month: "Jun", days: 9 },
    { month: "Jul", days: 12 },
    { month: "Aug", days: 8 },
    { month: "Sep", days: 7 },
  ];

  return NextResponse.json({
    complaintsByStatus,
    complaintsByCategory,
    pricesBreach,
    calculationsByStage,
    resolutionTimes,
  });
}
