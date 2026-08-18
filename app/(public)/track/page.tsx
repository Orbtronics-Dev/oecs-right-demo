import type { Metadata } from "next";
import ComplaintTracker from "@/features/complaints/components/ComplaintTracker";

export const metadata: Metadata = { title: "Track a case" };

export default function TrackPage() {
  return <ComplaintTracker />;
}
