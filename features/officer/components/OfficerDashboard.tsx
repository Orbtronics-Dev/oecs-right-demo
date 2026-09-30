"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  FileText,
  History,
  Plus,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Complaint } from "@/features/complaints/types";
import type { PriceEntry } from "@/features/prices/types";
import type { Officer } from "../types";
import { ROLE_LABELS, ROLE_TABS } from "../types";
import { fetchOfficerComplaints } from "../services/officer";
import { fetchPrices } from "@/features/prices/services/prices";
import OfficerHeader from "../layouts/OfficerHeader";
import CasesTab from "./CasesTab";
import PricesTab from "./PricesTab";
import PriceControlTab from "./PriceControlTab";
import AsycudaTab from "./AsycudaTab";
import ReportsTab from "./ReportsTab";
import SettingsTab from "./SettingsTab";
import AuditLogTab from "./AuditLogTab";

interface PriceCalculation {
  id: string;
  stage: "submitted" | "officer_verified" | "senior_certified" | "director_approved";
}

interface AsycudaSyncLogEntry {
  triggeredAt: string;
  status: "success" | "error" | "running";
}

const ALL_TABS = [
  { value: "cases",         label: "Cases",         Icon: FileText },
  { value: "price-control", label: "Price Control",  Icon: ShieldCheck },
  { value: "surveillance",  label: "Surveillance",   Icon: Plus },
  { value: "asycuda",       label: "ASYCUDA",        Icon: Database },
  { value: "reports",       label: "Reports",        Icon: BarChart3 },
  { value: "audit-log",     label: "Audit Log",      Icon: History },
  { value: "settings",      label: "Settings",       Icon: Settings },
] as const;

export default function OfficerDashboard() {
  const router = useRouter();
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [calculations, setCalculations] = useState<PriceCalculation[]>([]);
  const [latestSync, setLatestSync] = useState<AsycudaSyncLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/officer/me").then(async (r) => {
        if (r.status === 401) { router.push("/officer-login"); return null; }
        return r.json() as Promise<Officer>;
      }),
      fetchOfficerComplaints(),
      fetchPrices(),
      fetch("/api/officer/price-calculations").then((r) => r.json() as Promise<PriceCalculation[]>),
      fetch("/api/officer/asycuda/status").then((r) => r.json() as Promise<{ latest: AsycudaSyncLogEntry | null }>),
    ])
      .then(([officerData, complaintsData, pricesData, calculationsData, asycudaData]) => {
        if (officerData) setOfficer(officerData);
        setComplaints(complaintsData);
        setPrices(pricesData);
        setCalculations(calculationsData);
        setLatestSync(asycudaData.latest);
      })
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, [router]);

  const allowedTabs = useMemo(
    () => (officer ? ROLE_TABS[officer.role] : []),
    [officer]
  );

  const visibleTabs = ALL_TABS.filter((tab) => allowedTabs.includes(tab.value));
  const defaultTab = visibleTabs[0]?.value ?? "cases";

  const counts = useMemo(
    () => ({
      open: complaints.filter((c) => c.status !== "Resolved").length,
      unassigned: complaints.filter((c) => !c.assignedOfficer).length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      overLimit: prices.filter((p) => p.surveyedPrice > p.controlledPrice).length,
      pendingApproval: calculations.filter((c) => c.stage !== "director_approved").length,
      activeBreaches: prices.filter((p) => p.breachStatus === "open").length,
    }),
    [complaints, prices, calculations]
  );

  const lastSyncLabel = useMemo(() => {
    if (!latestSync) return "Never";
    return new Date(latestSync.triggeredAt).toLocaleDateString("en-LC", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [latestSync]);

  return (
    <>
      <OfficerHeader
        name={officer?.name ?? ""}
        role={officer ? ROLE_LABELS[officer.role] : ""}
      />

      <div className="shell py-6 sm:py-8">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4 xl:grid-cols-7">
          {[
            { icon: ClipboardList, label: "Open cases",          value: counts.open,           note: "Not yet resolved" },
            { icon: Clock,         label: "Awaiting assignment",  value: counts.unassigned,     note: "Needs an officer" },
            { icon: CheckCircle2,  label: "Resolved",             value: counts.resolved,       note: "This month" },
            { icon: TrendingUp,    label: "Prices above limit",   value: counts.overLimit,      note: `of ${prices.length} surveyed` },
            { icon: ShieldCheck,   label: "Calculations pending", value: counts.pendingApproval, note: "Awaiting director approval" },
            { icon: TrendingUp,    label: "Active breaches",      value: counts.activeBreaches, note: "Open breach flags" },
            { icon: Database,      label: "Last ASYCUDA sync",    value: lastSyncLabel,         note: latestSync?.status ?? "No sync yet", isText: true },
          ].map((item) => (
            <div key={item.label} className="border-t border-g-300 pt-4" data-hairline>
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

        {!loading && visibleTabs.length > 0 && (
          <Tabs defaultValue={defaultTab} className="mt-8">
            <TabsList>
              {visibleTabs.map(({ value, label, Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {allowedTabs.includes("cases") && (
              <TabsContent value="cases">
                <CasesTab complaints={complaints} onComplaintsChange={setComplaints} />
              </TabsContent>
            )}
            {allowedTabs.includes("price-control") && (
              <TabsContent value="price-control">
                <PriceControlTab role={officer?.role} />
              </TabsContent>
            )}
            {allowedTabs.includes("surveillance") && (
              <TabsContent value="surveillance">
                <PricesTab prices={prices} onPricesChange={setPrices} />
              </TabsContent>
            )}
            {allowedTabs.includes("asycuda") && (
              <TabsContent value="asycuda">
                <AsycudaTab />
              </TabsContent>
            )}
            {allowedTabs.includes("reports") && (
              <TabsContent value="reports">
                <ReportsTab />
              </TabsContent>
            )}
            {allowedTabs.includes("settings") && (
              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            )}
            {allowedTabs.includes("audit-log") && (
              <TabsContent value="audit-log">
                <AuditLogTab />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </>
  );
}
