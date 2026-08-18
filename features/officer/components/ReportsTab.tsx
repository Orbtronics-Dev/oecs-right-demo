"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Callout from "@/components/callout";
import {
  ComplaintsByCategoryChart,
  ComplaintsOverTimeChart,
  ComplianceByCategoryChart,
  ResolutionTimeChart,
} from "@/components/charts/analytics-charts";
import { toast } from "sonner";

export default function ReportsTab() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-2 text-ink">Reports and analytics</h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-g-600">
            Aggregate figures for the last six months, for quarterly reporting.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => toast.success("Report export queued", { description: "PDF · last 6 months" })}
        >
          <Download aria-hidden="true" />
          Export report
        </Button>
      </div>

      <Callout variant="info" className="mt-5">
        Figures are illustrative sample data for this prototype. Every chart below also has a table
        view for screen readers and for pasting into a report.
      </Callout>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ComplaintsOverTimeChart />
        <ComplaintsByCategoryChart />
        <ComplianceByCategoryChart />
        <ResolutionTimeChart />
      </div>
    </>
  );
}
