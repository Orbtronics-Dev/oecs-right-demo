import type { Metadata } from "next";
import OfficerDashboard from "@/features/officer/components/OfficerDashboard";

export const metadata: Metadata = { title: "Officer dashboard" };

export default function OfficerDashboardPage() {
  return <OfficerDashboard />;
}
