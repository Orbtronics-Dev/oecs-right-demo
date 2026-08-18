import {
  CheckCircle2,
  Clock,
  Inbox,
  Minus,
  Scale,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/data/mockData";

type Tone = "quiet" | "accent" | "ok" | "flag";

/**
 * Near-monochrome. Queued states sit in grey, in-progress states step up to
 * ink, and only the two ends of the scale — resolved and over-limit — earn a
 * hue. Every badge also carries an icon and a word, so none of this depends on
 * colour alone.
 */
const TONES: Record<Tone, string> = {
  quiet: "border-g-300 text-g-600",
  accent: "border-ink text-ink",
  ok: "border-ok/30 text-ok",
  flag: "border-flag/30 text-flag",
};

const StatusBadge = ({
  label,
  tone,
  icon: Icon,
  className,
}: {
  label: string;
  tone: Tone;
  icon: LucideIcon;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-pill border bg-transparent px-2.5 py-1 text-[0.75rem] font-medium whitespace-nowrap",
      TONES[tone],
      className,
    )}
  >
    <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden="true" />
    {label}
  </span>
);

/** Grey while it waits, accent while it is worked, green when it is done. */
const CASE_STATUS: Record<Complaint["status"], { tone: Tone; icon: LucideIcon }> = {
  Submitted: { tone: "quiet", icon: Inbox },
  "Under Review": { tone: "accent", icon: Clock },
  Investigation: { tone: "accent", icon: Scale },
  Resolved: { tone: "ok", icon: CheckCircle2 },
};

export const CaseStatusBadge = ({
  status,
  className,
}: {
  status: Complaint["status"];
  className?: string;
}) => {
  const { tone, icon } = CASE_STATUS[status];
  return <StatusBadge label={status} tone={tone} icon={icon} className={className} />;
};

export const PriceStatusBadge = ({
  overLimit,
  className,
}: {
  overLimit: boolean;
  className?: string;
}) =>
  overLimit ? (
    <StatusBadge label="Above limit" tone="flag" icon={TrendingUp} className={className} />
  ) : (
    <StatusBadge label="Within limit" tone="ok" icon={Minus} className={className} />
  );

export default StatusBadge;
