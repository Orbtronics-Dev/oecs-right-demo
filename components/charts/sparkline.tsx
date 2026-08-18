import type { PriceHistoryPoint as PricePoint } from "@/features/prices/types";

/**
 * Micro trend mark. Plain SVG rather than a chart library: twelve of these render
 * in a table body, and none of them need interaction — the signed delta beside it
 * carries the reading, so the line is decoration for the number, not the source
 * of truth.
 */
const Sparkline = ({
  data,
  width = 84,
  height = 26,
  className,
}: {
  data: PricePoint[];
  width?: number;
  height?: number;
  className?: string;
}) => {
  if (data.length < 2) {
    return (
      <span className="text-sm text-g-600" aria-label="Not enough data for a trend">
        —
      </span>
    );
  }

  const values = data.map((point) => point.surveyed);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;

  const x = (index: number) => (index / (data.length - 1)) * (width - pad * 2) + pad;
  const y = (value: number) => height - pad - ((value - min) / span) * (height - pad * 2);

  const line = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const lastX = x(values.length - 1);
  const lastY = y(values[values.length - 1]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={line}
        fill="none"
        stroke="hsl(var(--green-ink))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Surface ring keeps the end point legible where it overlaps the line */}
      <circle cx={lastX} cy={lastY} r="3.5" fill="white" />
      <circle cx={lastX} cy={lastY} r="2.5" fill="hsl(var(--green-ink))" />
    </svg>
  );
};

export default Sparkline;
