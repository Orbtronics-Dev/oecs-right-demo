"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  FileText,
  Plus,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Complaint } from "@/features/complaints/types";
import type { PriceEntry } from "@/features/prices/types";
import { fetchOfficerComplaints } from "../services/officer";
import { fetchPrices } from "@/features/prices/services/prices";
import OfficerHeader from "../layouts/OfficerHeader";
import CasesTab from "./CasesTab";
import PricesTab from "./PricesTab";
import PriceControlTab from "./PriceControlTab";
import AsycudaTab from "./AsycudaTab";
import ReportsTab from "./ReportsTab";
import SettingsTab from "./SettingsTab";

interface PriceCalculation {
  id: string;
  stage: "submitted" | "officer_verified" | "senior_certified" | "director_approved";
}

interface AsycudaSyncLogEntry {
  triggeredAt: string;
  status: "success" | "error" | "running";
}

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [calculations, setCalculations] = useState<PriceCalculation[]>([]);
  const [latestSync, setLatestSync] = useState<AsycudaSyncLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOfficerComplaints(),
      fetchPrices(),
      fetch("/api/officer/price-calculations").then((response) => response.json() as Promise<PriceCalculation[]>),
      fetch("/api/officer/asycuda/status").then((response) => response.json() as Promise<{ latest: AsycudaSyncLogEntry | null }>),
    ])
      .then(([complaintsData, pricesData, calculationsData, asycudaData]) => {
        setComplaints(complaintsData);
        setPrices(pricesData);
        setCalculations(calculationsData);
        setLatestSync(asycudaData.latest);
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      open: complaints.filter((complaint) => complaint.status !== "Resolved").length,
      unassigned: complaints.filter((complaint) => !complaint.assignedOfficer).length,
      resolved: complaints.filter((complaint) => complaint.status === "Resolved").length,
      overLimit: prices.filter((price) => price.surveyedPrice > price.controlledPrice).length,
      pendingApproval: calculations.filter(
        (calculation) => calculation.stage !== "director_approved"
      ).length,
      activeBreaches: prices.filter((price) => price.breachStatus === "open").length,
    }),
    [complaints, prices, calculations]
  );

  const lastSyncLabel = useMemo(() => {
    if (!latestSync) return "Never";
    const syncDate = new Date(latestSync.triggeredAt);
    return syncDate.toLocaleDateString("en-LC", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [latestSync]);

  return (
    <>
      <OfficerHeader name="Officer K. Williams" role="Senior Consumer Affairs Officer" />

      <div className="shell py-6 sm:py-8">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4 xl:grid-cols-7">
          {[
            {
              icon: ClipboardList,
              label: "Open cases",
              value: counts.open,
              note: "Not yet resolved",
            },
            {
              icon: Clock,
              label: "Awaiting assignment",
              value: counts.unassigned,
              note: "Needs an officer",
            },
            {
              icon: CheckCircle2,
              label: "Resolved",
              value: counts.resolved,
              note: "This month",
            },
            {
              icon: TrendingUp,
              label: "Prices above limit",
              value: counts.overLimit,
              note: `of ${prices.length} surveyed`,
            },
            {
              icon: ShieldCheck,
              label: "Calculations pending",
              value: counts.pendingApproval,
              note: "Awaiting director approval",
            },
            {
              icon: TrendingUp,
              label: "Active breaches",
              value: counts.activeBreaches,
              note: "Open breach flags",
            },
            {
              icon: Database,
              label: "Last ASYCUDA sync",
              value: lastSyncLabel,
              note: latestSync?.status ?? "No sync yet",
              isText: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-t border-g-300 pt-4"
              data-hairline
            >
              <dt className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.14em] text-g-600 uppercase">
                <item.icon className="h-3.5 w-3.5 text-g-600" aria-hidden="true" />
                {item.label}
              </dt>
              <dd
                className={`mt-3 text-ink ${(item as { isText?: boolean }).isText ? "text-[1rem] font-semibold" : "figure-sm"}`}
                data-numeric=""
              >
                {loading ? "-" : item.value}
              </dd>
              <p className="mt-1 text-[0.75rem] text-g-600">{item.note}</p>
            </div>
          ))}
        </dl>

        <Tabs defaultValue="cases" className="mt-8">
          <TabsList>
            <TabsTrigger value="cases">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="price-control">
              <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Price Control
            </TabsTrigger>
            <TabsTrigger value="surveillance">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Surveillance
            </TabsTrigger>
            <TabsTrigger value="asycuda">
              <Database className="mr-2 h-4 w-4" aria-hidden="true" />
              ASYCUDA
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <CasesTab complaints={complaints} onComplaintsChange={setComplaints} />
          </TabsContent>
          <TabsContent value="price-control">
            <PriceControlTab />
          </TabsContent>
          <TabsContent value="surveillance">
            <PricesTab prices={prices} onPricesChange={setPrices} />
          </TabsContent>
          <TabsContent value="asycuda">
            <AsycudaTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
