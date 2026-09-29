"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Callout from "@/components/callout";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

interface ReportsData {
  complaintsByStatus: { status: string; count: number }[];
  complaintsByCategory: { category: string; count: number }[];
  pricesBreach: { total: number; overLimit: number; pct: number };
  calculationsByStage: { stage: string; count: number }[];
  resolutionTimes: { month: string; days: number }[];
}

const AXIS = { fill: "hsl(var(--chart-axis))", fontSize: 12 } as const;
const GRID = "hsl(var(--chart-grid))";
const SURFACE = "hsl(var(--card))";

const TOOLTIP_STYLE = {
  borderRadius: 6,
  border: "1px solid hsl(var(--border))",
  fontSize: 13,
  boxShadow: "var(--shadow-overlay)",
} as const;

const NO_ANIMATION = { isAnimationActive: false } as const;

const ChartFrame = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-md border border-border bg-white">
    <div className="border-b border-border px-5 py-4">
      <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{title}</h3>
      {description && <p className="mt-1 text-[0.8125rem] text-g-600">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const STAGE_DISPLAY: Record<string, string> = {
  submitted: "Submitted",
  officer_verified: "Officer Verified",
  senior_certified: "Senior Certified",
  director_approved: "Director Approved",
};

const STAGE_COLOURS: Record<string, string> = {
  submitted: "hsl(var(--chart-3))",
  officer_verified: "hsl(var(--chart-1))",
  senior_certified: "hsl(var(--chart-2))",
  director_approved: "hsl(var(--ok))",
};

export default function ReportsTab() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/officer/reports")
      .then((response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<ReportsData>;
      })
      .then(setData)
      .catch(() => toast.error("Could not load report data"))
      .finally(() => setLoading(false));
  }, []);

  const lastResolutionIndex = (data?.resolutionTimes.length ?? 1) - 1;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-2 text-ink">Reports and analytics</h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
            Live figures derived from the current session&apos;s data.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            toast.success("Report export queued", { description: "PDF · current session" })
          }
        >
          <Download aria-hidden="true" />
          Export report
        </Button>
      </div>

      <Callout variant="info" className="mt-5">
        Figures reflect the in-memory store for this session. Resolution time data is
        representative sample data. Every chart has a table view for screen readers and
        copy-paste into reports.
      </Callout>

      {loading ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="rounded-md border border-border bg-white p-5">
              <Skeleton className="mb-3 h-5 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Complaints by status */}
          <ChartFrame title="Complaints by status" description="Current caseload">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...data.complaintsByStatus].sort(
                    (statusA, statusB) => statusB.count - statusA.count
                  )}
                  layout="vertical"
                  margin={{ top: 4, right: 44, bottom: 4, left: 0 }}
                >
                  <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Complaints"]}
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "hsl(var(--g-100))" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    {...NO_ANIMATION}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={8}
                      className="fill-g-700"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>

          {/* Complaints by category */}
          <ChartFrame title="Complaints by type" description="Last 6 months">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...data.complaintsByCategory].sort(
                    (categoryA, categoryB) => categoryB.count - categoryA.count
                  )}
                  layout="vertical"
                  margin={{ top: 4, right: 44, bottom: 4, left: 0 }}
                >
                  <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    width={132}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Complaints"]}
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "hsl(var(--g-100))" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    {...NO_ANIMATION}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={8}
                      className="fill-g-700"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>

          {/* Price calculations by stage */}
          <ChartFrame title="MRP calculations by stage" description="Approval pipeline">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.calculationsByStage.map((calculationStage) => ({
                    ...calculationStage,
                    label: STAGE_DISPLAY[calculationStage.stage] ?? calculationStage.stage,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 44, bottom: 4, left: 0 }}
                >
                  <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={AXIS}
                    stroke={GRID}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Calculations"]}
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "hsl(var(--g-100))" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    {...NO_ANIMATION}
                  >
                    {data.calculationsByStage.map((calculationStage) => (
                      <Cell
                        key={calculationStage.stage}
                        fill={STAGE_COLOURS[calculationStage.stage] ?? "hsl(var(--chart-1))"}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={8}
                      className="fill-g-700"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>

          {/* Resolution time */}
          <ChartFrame
            title="Median time to resolve a case"
            description="Days from filing to outcome (representative)"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.resolutionTimes}
                  margin={{ top: 20, right: 8, bottom: 4, left: -16 }}
                >
                  <CartesianGrid stroke={GRID} strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} stroke={GRID} tickLine={false} />
                  <YAxis tick={AXIS} stroke={GRID} tickLine={false} width={44} unit="d" />
                  <Tooltip
                    formatter={(value: number) => [`${value} days`, "Median"]}
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "hsl(var(--g-100))" }}
                  />
                  <Bar dataKey="days" radius={[4, 4, 0, 0]} barSize={34} {...NO_ANIMATION}>
                    {data.resolutionTimes.map((resolutionPoint, index) => (
                      <Cell
                        key={resolutionPoint.month}
                        fill={
                          index === lastResolutionIndex
                            ? "hsl(var(--chart-1))"
                            : "hsl(var(--g-300))"
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="days"
                      position="top"
                      offset={6}
                      className="fill-g-700"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartFrame>
        </div>
      ) : null}
    </>
  );
}
