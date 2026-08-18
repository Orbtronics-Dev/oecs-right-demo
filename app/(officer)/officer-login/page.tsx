import type { Metadata } from "next";
import OfficerLoginForm from "@/features/officer/components/OfficerLoginForm";

export const metadata: Metadata = { title: "Officer portal" };

export default function OfficerLoginPage() {
  return <OfficerLoginForm />;
}
