import { cn } from "@/lib/utils";

/**
 * Deliberately generic identity for the design sample.
 *
 * This sample must not carry any real organisation's branding. Each country
 * will run its own site with its own crest, colours and content, and putting a
 * regional body's mark here would imply a single shared portal — which is not
 * what is being built. It equally must not use any one country's crest, since
 * that would single that country out.
 *
 * So: a neutral drawn mark and a neutral wordmark, sized and positioned exactly
 * where a national crest would sit. Swapping this component is the whole of the
 * branding work for a national implementation.
 */
const ServiceMark = ({
  className,
  tone = "light",
}: {
  className?: string;
  /** "light" for the canvas, "dark" for the ink footer. */
  tone?: "light" | "dark";
}) => {
  const dark = tone === "dark";

  return (
    <span className={cn("flex items-center gap-3", className)}>
      {/* Placeholder crest. A dashed edge signals "your logo goes here" without
          looking broken. */}
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed",
          dark ? "border-white/40" : "border-g-400",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M12 2.5 3.75 5.4v6.3c0 4.8 3.5 8.05 8.25 9.15 4.75-1.1 8.25-4.35 8.25-9.15V5.4L12 2.5Z"
            className={dark ? "stroke-white/70" : "stroke-g-500"}
            strokeWidth="1.6"
          />
        </svg>
      </span>

      <span className="leading-tight">
        <span
          className={cn(
            "block font-serif text-[1.1875rem] tracking-[-0.012em]",
            dark ? "text-white" : "text-ink",
          )}
        >
          Consumer Protection
        </span>
        <span
          className={cn(
            "mt-1 block text-[0.625rem] tracking-[0.12em] uppercase",
            dark ? "text-white/55" : "text-g-600",
          )}
        >
          Consumer Affairs Division
        </span>
      </span>
    </span>
  );
};

export default ServiceMark;
