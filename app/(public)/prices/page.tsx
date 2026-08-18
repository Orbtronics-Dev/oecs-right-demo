import type { Metadata } from "next";
import PriceCheckPage from "@/features/prices/components/PriceCheckPage";

export const metadata: Metadata = { title: "Check prices" };

export default function PricesPage() {
  return <PriceCheckPage />;
}
