"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Callout from "@/components/callout";
import PriceHistoryChart from "@/components/charts/price-history-chart";
import type { PriceEntry } from "@/data/mockData";

const money = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * The expanded body of a price row. Shared by the desktop table and the mobile
 * card list so the two never drift apart.
 */
const PriceDetail = ({
  entry,
  onSetAlert,
}: {
  entry: PriceEntry;
  onSetAlert: (entry: PriceEntry) => void;
}) => {
  const overLimit = entry.surveyedPrice > entry.controlledPrice;

  // `minmax(0,1fr)` rather than a bare `1fr`: 1fr floors at the content's min
  // width, which inside a table cell leaves the chart column unresolvable and
  // collapses recharts' ResponsiveContainer to width 0.
  return (
    <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <div className="min-w-0">
        <h3 className="font-serif text-[1.25rem] tracking-[-0.012em] text-ink">
          Surveyed price over the last 6 months
        </h3>
        <div className="mt-4">
          <PriceHistoryChart
            history={entry.history}
            controlledPrice={entry.controlledPrice}
            unitLabel={entry.unit}
          />
        </div>
      </div>

      <div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          {[
            ["Shop or supplier", entry.supplier],
            ["Category", entry.category],
            ["Last checked", formatDate(entry.lastUpdated)],
            ["Surveyed price", money(entry.surveyedPrice)],
            ["Legal maximum", money(entry.controlledPrice)],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="text-[0.625rem] font-semibold tracking-[0.1em] text-g-600 uppercase">
                {term}
              </dt>
              <dd className="mt-1 text-[0.9375rem] text-ink" data-numeric="">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {overLimit && (
          <Callout
            variant="danger"
            title="This price is above the legal maximum"
            className="mt-6"
          >
            You can report this shop. Keep your receipt — it is the strongest evidence.
          </Callout>
        )}

        <Button variant="secondary" size="sm" className="mt-6" onClick={() => onSetAlert(entry)}>
          <Bell aria-hidden="true" />
          Email me if this price changes
        </Button>
      </div>
    </div>
  );
};

export default PriceDetail;
