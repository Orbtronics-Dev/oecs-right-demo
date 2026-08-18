import CountUp from "@/components/motion/count-up";
import Reveal from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface StatItem {
  /** Numeric value drives the count-up; the string form is the fallback. */
  value: number;
  label: string;
  note?: string;
  /** Rendered after the figure, e.g. "%" or "days". */
  suffix?: string;
}

const COLUMNS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Oversized serif figures separated by hairlines. No boxes, no fills — the
 * numeral is the object. Each one counts up once when it scrolls into view, and
 * renders at its final value on the server so the real number is always in the
 * DOM whether or not the animation ever runs.
 */
export const StatRow = ({
  items,
  tone = "light",
  columns = 3,
  className,
}: {
  items: StatItem[];
  tone?: "light" | "ink";
  columns?: 2 | 3 | 4;
  className?: string;
}) => (
  <dl className={cn("grid gap-x-8 gap-y-10", COLUMNS[columns], className)}>
    {items.map((item, index) => (
      <Reveal key={item.label} delay={index * 80} as="div">
        <div
          className={cn(
            "border-t pt-5",
            tone === "ink" ? "border-white/20" : "border-g-300",
          )}
          data-hairline
        >
          <dt
            className={cn(
              "text-[0.6875rem] tracking-[0.14em] uppercase",
              tone === "ink" ? "text-white/50" : "text-g-600",
            )}
          >
            {item.label}
          </dt>
          <dd className={cn("figure mt-4", tone === "ink" ? "text-white" : "text-ink")}>
            <CountUp value={item.value} />
            {item.suffix && (
              <span className="ml-1 font-sans text-[0.375em] tracking-normal align-super">
                {item.suffix}
              </span>
            )}
          </dd>
          {item.note && (
            <p
              className={cn(
                "mt-3 text-[0.8125rem] leading-relaxed",
                tone === "ink" ? "text-white/45" : "text-g-600",
              )}
            >
              {item.note}
            </p>
          )}
        </div>
      </Reveal>
    ))}
  </dl>
);

export default StatRow;
