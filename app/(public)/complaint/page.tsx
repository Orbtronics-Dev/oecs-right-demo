import type { Metadata } from "next";
import ComplaintForm from "@/features/complaints/components/ComplaintForm";

export const metadata: Metadata = { title: "File a complaint" };

export default function ComplaintPage() {
  return <ComplaintForm />;
}
