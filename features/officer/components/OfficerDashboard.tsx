"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, Clock, FileText, Plus, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Complaint } from "@/features/complaints/types";
import type { PriceEntry } from "@/features/prices/types";
import { fetchOfficerComplaints } from "../services/officer";
import { fetchPrices } from "@/features/prices/services/prices";
import OfficerHeader from "../layouts/OfficerHeader";
import CasesTab from "./CasesTab";
import PricesTab from "./PricesTab";
import ReportsTab from "./ReportsTab";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOfficerComplaints(), fetchPrices()])
      .then(([complaintsData, pricesData]) => {
        setComplaints(complaintsData);
        setPrices(pricesData);
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    open: complaints.filter((c) => c.status !== "Resolved").length,
    unassigned: complaints.filter((c) => !c.assignedOfficer).length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    overLimit: prices.filter((p) => p.surveyedPrice > p.controlledPrice).length,
  }), [complaints, prices]);

  return (
    <>
      <OfficerHeader name="Officer K. Williams" role="Senior Consumer Affairs Officer" />

      <div className="shell py-6 sm:py-8">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
          {[
            { icon: ClipboardList, label: "Open cases", value: counts.open, note: "Not yet resolved" },
            { icon: Clock, label: "Awaiting assignment", value: counts.unassigned, note: "Needs an officer" },
            { icon: CheckCircle2, label: "Resolved", value: counts.resolved, note: "This month" },
            { icon: TrendingUp, label: "Prices above limit", value: counts.overLimit, note: `of ${prices.length} surveyed` },
          ].map((item) => (
            <div key={item.label} className="border-t border-g-300 pt-4" data-hairline>
              <dt className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                <item.icon className="h-3.5 w-3.5 text-g-600" aria-hidden="true" />
                {item.label}
              </dt>
              <dd className="figure-sm mt-3 text-ink" data-numeric="">{loading ? "—" : item.value}</dd>
              <p className="mt-1 text-[0.75rem] text-g-600">{item.note}</p>
            </div>
          ))}
        </dl>

        <Tabs defaultValue="cases" className="mt-8">
          <TabsList>
            <TabsTrigger value="cases">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />Cases
            </TabsTrigger>
            <TabsTrigger value="prices">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />Price surveillance
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />Reports &amp; analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <CasesTab complaints={complaints} onComplaintsChange={setComplaints} />
          </TabsContent>
          <TabsContent value="prices">
            <PricesTab prices={prices} onPricesChange={setPrices} />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
