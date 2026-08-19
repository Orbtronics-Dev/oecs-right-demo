import { Check } from "lucide-react";
import { mergeClassNames } from "@/lib/utils";

/**
 * "Step 2 of 5" in words, then a hairline track, then the named steps. The count
 * is what a reader needs; the names are orientation. The track animates its
 * width between steps, which is the one bit of motion in the form itself.
 */
const StepProgress = ({
  steps,
  current,
  className,
}: {
  steps: string[];
  /** 1-based. */
  current: number;
  className?: string;
}) => {
  const percent = Math.round((current / steps.length) * 100);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[0.9375rem] text-ink">
          <span className="font-medium">
            Step {current} of {steps.length}
          </span>
          <span className="ml-2 text-g-600">{steps[current - 1]}</span>
        </p>
        <p className="text-[0.8125rem] text-g-600" data-numeric="">
          {percent}%
        </p>
      </div>

      <div
        className="mt-3 h-px w-full bg-g-300"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`Step ${current} of ${steps.length}: ${steps[current - 1]}`}
      >
        <div
          className="h-full bg-brand-green transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-4 hidden gap-6 sm:flex">
        {steps.map((step, index) => {
          const number = index + 1;
          const done = number < current;
          const active = number === current;

          return (
            <li
              key={step}
              className={mergeClassNames(
                "flex min-w-0 items-center gap-1.5 text-[0.8125rem] transition-colors",
                active ? "text-ink" : done ? "text-g-600" : "text-g-400",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-ok" strokeWidth={3} aria-hidden="true" />
              ) : (
                <span className="shrink-0 tabular-nums">{String(number).padStart(2, "0")}</span>
              )}
              <span className="truncate">{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepProgress;
