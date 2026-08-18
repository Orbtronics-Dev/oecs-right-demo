"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/data/mockData";

const money = (value: number) => `$${value.toFixed(2)}`;

/**
 * One measure on one axis: the surveyed price over six months, with the legal
 * maximum drawn as a labelled reference line. A second y-axis would be the
 * classic mistake here — the limit belongs on the same scale as the price.
 */
const PriceHistoryChart = ({
  history,
  controlledPrice,
  unitLabel,
}: {
  history: PricePoint[];
  controlledPrice: number;
  unitLabel: string;
}) => {
  const values = history.map((point) => point.surveyed);
  const low = Math.min(...values, controlledPrice);
  const high = Math.max(...values, controlledPrice);
  const pad = Math.max((high - low) * 0.25, 0.15);

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
              stroke="hsl(var(--chart-grid))"
              tickLine={false}
            />
            <YAxis
              domain={[low - pad, high + pad]}
              tickFormatter={money}
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
              stroke="hsl(var(--chart-grid))"
              tickLine={false}
              width={62}
            />
            <Tooltip
              formatter={(value: number) => [money(value), "Surveyed price"]}
              contentStyle={{
                borderRadius: 6,
                border: "1px solid hsl(var(--border))",
                fontSize: 13,
                boxShadow: "var(--shadow-overlay)",
              }}
            />
            <ReferenceLine
              y={controlledPrice}
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: `Legal maximum ${money(controlledPrice)}`,
                position: "insideTopRight",
                fill: "hsl(var(--chart-3))",
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Line
              type="monotone"
              dataKey="surveyed"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(var(--chart-1))" }}
              activeDot={{ r: 5 }}
              name="Surveyed price"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table view — the chart is never the only way to read the numbers. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">
          View these figures as a table
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">
            Surveyed price per {unitLabel} over the last six months
          </caption>
          <thead>
            <tr className="border-b border-border bg-g-100">
              <th scope="col" className="px-3 py-2 text-left font-semibold text-g-700">
                Month
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-g-700">
                Surveyed
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-g-700">
                Legal maximum
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((point) => (
              <tr key={point.month} className="border-b border-g-200">
                <th scope="row" className="px-3 py-2 text-left font-medium text-ink">
                  {point.month}
                </th>
                <td className="px-3 py-2 text-right text-ink" data-numeric="">
                  {money(point.surveyed)}
                </td>
                <td className="px-3 py-2 text-right text-g-600" data-numeric="">
                  {money(controlledPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

export default PriceHistoryChart;
