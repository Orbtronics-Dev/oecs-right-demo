"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  complaintsByCategory,
  complaintsByMonth,
  complianceByCategory,
  resolutionTimeByMonth,
} from "@/data/mockData";

/* Shared axis/grid styling — recessive by design, so the marks carry the eye. */
const AXIS = { fill: "hsl(var(--chart-axis))", fontSize: 12 } as const;
const GRID = "hsl(var(--chart-grid))";
const SURFACE = "hsl(var(--card))";

const TOOLTIP_STYLE = {
  borderRadius: 6,
  border: "1px solid hsl(var(--border))",
  fontSize: 13,
  boxShadow: "var(--shadow-overlay)",
} as const;

/**
 * Entry animations are off across the board. A report screen should be readable
 * the instant it paints — an animating chart is a chart you cannot yet read, and
 * it also defeats printing and screenshotting for the quarterly report.
 */
const NO_ANIMATION = { isAnimationActive: false } as const;

/** Legend labels wear text tokens; the swatch beside them carries identity. */
const legendLabel = (value: string) => (
  <span className="text-[0.8125rem] text-g-700">{value}</span>
);

const LEGEND_PROPS = {
  verticalAlign: "top",
  align: "left",
  height: 32,
  formatter: legendLabel,
  wrapperStyle: { paddingLeft: 12 },
} as const;

/** Wraps a chart with its heading and an always-available table view. */
const ChartFrame = ({
  title,
  description,
  children,
  table,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  table: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-md border border-border bg-white ${className ?? ""}`}>
    <div className="border-b border-border px-5 py-4">
      <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">{title}</h3>
      {description && <p className="mt-1 text-[0.8125rem] text-g-600">{description}</p>}
    </div>
    <div className="p-5">
      {children}
      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">
          View as a table
        </summary>
        <div className="mt-3 overflow-x-auto">{table}</div>
      </details>
    </div>
  </section>
);

const SimpleTable = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number)[][];
}) => (
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="border-b border-border bg-g-100">
        {columns.map((column, index) => (
          <th
            key={column}
            scope="col"
            className={`px-3 py-2 font-semibold text-g-700 ${index === 0 ? "text-left" : "text-right"}`}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={String(row[0])} className="border-b border-g-200">
          {row.map((cell, index) =>
            index === 0 ? (
              <th key={index} scope="row" className="px-3 py-2 text-left font-medium text-ink">
                {cell}
              </th>
            ) : (
              <td key={index} className="px-3 py-2 text-right text-ink" data-numeric="">
                {cell}
              </td>
            ),
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

/* ------------------------------------------------------------------ 1 of 4 */

/**
 * Magnitude across a handful of named categories → horizontal bars, sorted
 * descending. One series, so no legend: the title already names the measure.
 */
export const ComplaintsByCategoryChart = () => {
  const data = [...complaintsByCategory].sort((a, b) => b.count - a.count);

  return (
    <ChartFrame
      title="Complaints by type"
      description="Last 6 months"
      table={
        <SimpleTable
          columns={["Type of problem", "Complaints"]}
          rows={data.map((row) => [row.category, row.count])}
        />
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
            {/* Headroom above dataMax so the axis's last tick cannot collide with
                the direct label on the longest bar. */}
            <XAxis
              type="number"
              domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.2) / 50) * 50]}
              tick={AXIS}
              stroke={GRID}
              tickLine={false}
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
            {/* 4px rounded data-end, anchored square to the baseline */}
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
  );
};

/* ------------------------------------------------------------------ 2 of 4 */

/**
 * Renders a value label only on the final point of a line — the direct label
 * that lets a reader name each series without consulting the legend. Recharts
 * requires an SVG element back, so non-final points return an empty group.
 */
const endLabel = (color: string) =>
  function EndLabel(props: { x?: number; y?: number; index?: number; value?: number }) {
    const { x, y, index, value } = props;
    if (index !== complaintsByMonth.length - 1 || x == null || y == null) return <g />;
    return (
      <text
        x={x + 8}
        y={y + 4}
        fill={color}
        fontSize={12}
        fontWeight={700}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </text>
    );
  };

/**
 * Two series on one axis — both are complaint counts, so they belong on the same
 * scale. Legend plus a direct label on each line's final point, so identity
 * never rests on hue alone.
 */
export const ComplaintsOverTimeChart = () => (
  <ChartFrame
    title="Complaints filed and resolved"
    description="Monthly"
    table={
      <SimpleTable
        columns={["Month", "Filed", "Resolved"]}
        rows={complaintsByMonth.map((row) => [row.month, row.filed, row.resolved])}
      />
    }
  >
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={complaintsByMonth} margin={{ top: 8, right: 52, bottom: 4, left: -12 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="month" tick={AXIS} stroke={GRID} tickLine={false} />
          <YAxis tick={AXIS} stroke={GRID} tickLine={false} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend {...LEGEND_PROPS} iconType="plainline" />
          <Line
            type="monotone"
            dataKey="filed"
            name="Filed"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, stroke: SURFACE, fill: "hsl(var(--chart-1))" }}
            activeDot={{ r: 5 }}
            label={endLabel("hsl(var(--chart-1))")}
            {...NO_ANIMATION}
          />
          <Line
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, stroke: SURFACE, fill: "hsl(var(--chart-2))" }}
            activeDot={{ r: 5 }}
            label={endLabel("hsl(var(--chart-2))")}
            {...NO_ANIMATION}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </ChartFrame>
);

/* ------------------------------------------------------------------ 3 of 4 */

/**
 * Parts of a whole per country. Stacked, with a 2px surface stroke so the two
 * segments never touch, and both segments directly labelled with their share.
 */
export const ComplianceByCategoryChart = () => (
  <ChartFrame
    title="Price compliance by category"
    description="Share of surveyed prices within the legal maximum"
    table={
      <SimpleTable
        columns={["Category", "Within limit %", "Above limit %"]}
        rows={complianceByCategory.map((row) => [row.category, row.withinLimit, row.aboveLimit])}
      />
    }
  >
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={complianceByCategory}
          layout="vertical"
          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
        >
          {/* Shares already sum to 100, so a fixed domain is both correct and
              predictable — no normalising offset to reason about. */}
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="category"
            tick={AXIS}
            stroke={GRID}
            tickLine={false}
            width={110}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "hsl(var(--g-100))" }}
          />
          <Legend {...LEGEND_PROPS} />
          <Bar
            dataKey="withinLimit"
            name="Within limit"
            stackId="compliance"
            fill="hsl(var(--chart-1))"
            stroke={SURFACE}
            strokeWidth={2}
            barSize={22}
            {...NO_ANIMATION}
          >
            <LabelList
              dataKey="withinLimit"
              position="insideLeft"
              offset={10}
              formatter={(value: number) => `${value}%`}
              style={{ fontSize: 12, fontWeight: 700, fill: "white" }}
            />
          </Bar>
          <Bar
            dataKey="aboveLimit"
            name="Above limit"
            stackId="compliance"
            fill="hsl(var(--chart-3))"
            stroke={SURFACE}
            strokeWidth={2}
            barSize={22}
            radius={[0, 4, 4, 0]}
            {...NO_ANIMATION}
          >
            <LabelList
              dataKey="aboveLimit"
              position="insideRight"
              offset={10}
              formatter={(value: number) => `${value}%`}
              style={{ fontSize: 12, fontWeight: 700, fill: "white" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartFrame>
);

/* ------------------------------------------------------------------ 4 of 4 */

/**
 * One measure over time where the newest value is the point of the chart — so
 * the final bar is emphasised and labelled, and the rest recede.
 */
export const ResolutionTimeChart = () => {
  const last = resolutionTimeByMonth.length - 1;

  return (
    <ChartFrame
      title="Median time to resolve a case"
      description="Days from filing to outcome"
      table={
        <SimpleTable
          columns={["Month", "Median days"]}
          rows={resolutionTimeByMonth.map((row) => [row.month, row.days])}
        />
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resolutionTimeByMonth} margin={{ top: 20, right: 8, bottom: 4, left: -16 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="month" tick={AXIS} stroke={GRID} tickLine={false} />
            <YAxis tick={AXIS} stroke={GRID} tickLine={false} width={44} unit="d" />
            <Tooltip
              formatter={(value: number) => [`${value} days`, "Median"]}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "hsl(var(--g-100))" }}
            />
            <Bar dataKey="days" radius={[4, 4, 0, 0]} barSize={34} {...NO_ANIMATION}>
              {resolutionTimeByMonth.map((row, index) => (
                <Cell
                  key={row.month}
                  fill={index === last ? "hsl(var(--chart-1))" : "hsl(var(--g-300))"}
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
  );
};
