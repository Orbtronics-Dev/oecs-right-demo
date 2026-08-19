import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { mergeClassNames } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  /** Plain-language help shown before the input, where it gets read. */
  hint?: string;
  error?: string;
  optional?: boolean;
  /**
   * For fields sitting side by side in a row. Pins the control to the bottom of
   * the cell so the inputs line up even when one field's hint wraps to a
   * different number of lines than its neighbour's.
   */
  aligned?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Label → hint → error → input, in that order.
 *
 * The order matters: a hint placed under an input is announced after the reader
 * has already tried to answer. An error bar on the left edge makes a failed
 * field findable by scanning, not just by colour.
 */
const Field = ({
  id,
  label,
  hint,
  error,
  optional,
  aligned,
  children,
  className,
}: FieldProps) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div
      className={mergeClassNames(
        error && "border-l-2 border-l-flag pl-4",
        aligned && "flex h-full flex-col",
        className,
      )}
    >
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-g-600">(optional)</span>}
      </Label>

      {hint && (
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-g-600">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-flag">
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className={mergeClassNames("mt-2", aligned && "mt-auto pt-2")}>{children}</div>
    </div>
  );
};

/** Builds the aria-describedby value for a field's control. */
export const describedBy = (id: string, hint?: boolean, error?: boolean) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

export default Field;
