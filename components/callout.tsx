import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "success" | "danger";

/**
 * A vertical rule and a coloured icon carry the tone — no tinted panel. On a
 * near-monochrome canvas a filled box shouts, and it is also the first thing to
 * disappear in high-contrast mode; a rule survives both.
 */
const VARIANTS: Record<Variant, { rule: string; icon: LucideIcon; iconColor: string; heading: string }> = {
  info: { rule: "bg-g-300", icon: Info, iconColor: "text-g-600", heading: "text-ink" },
  warning: { rule: "bg-ink", icon: AlertTriangle, iconColor: "text-ink", heading: "text-ink" },
  success: { rule: "bg-ok", icon: CheckCircle2, iconColor: "text-ok", heading: "text-ink" },
  danger: { rule: "bg-flag", icon: OctagonAlert, iconColor: "text-flag", heading: "text-flag" },
};

const Callout = ({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: Variant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn("relative pl-6", className)}
      role={variant === "danger" ? "alert" : undefined}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-[2px] rounded-pill", config.rule)}
        aria-hidden="true"
      />
      <div className="flex gap-3 py-1">
        <Icon className={cn("mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0", config.iconColor)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title && (
            <p className={cn("font-serif text-[1.125rem] tracking-[-0.012em]", config.heading)}>
              {title}
            </p>
          )}
          {children && (
            <div className={cn("text-[0.9375rem] leading-relaxed text-g-700", title && "mt-2")}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Callout;
