import { BookOpen, FileText, Megaphone, ShieldAlert, type LucideIcon } from "lucide-react";
import { mergeClassNames } from "@/lib/utils";
import type { UpdateKind } from "@/data/mockData";

const ICONS: Record<UpdateKind, LucideIcon> = {
  "Price notice": FileText,
  Event: Megaphone,
  "Safety alert": ShieldAlert,
  Guidance: BookOpen,
};

/**
 * Only a safety alert takes a hue - everything else stays in ink and grey, so
 * the one kind that carries urgency is the one that stands out. The icon and the
 * word do the identifying either way.
 */
const TONES: Record<UpdateKind, string> = {
  "Safety alert": "text-flag",
  "Price notice": "text-g-600",
  Event: "text-g-600",
  Guidance: "text-g-600",
};

export const UpdateKindTag = ({
  kind,
  className,
}: {
  kind: UpdateKind;
  className?: string;
}) => {
  const Icon = ICONS[kind];
  return (
    <span
      className={mergeClassNames(
        "inline-flex items-center gap-1.5 text-[0.6875rem] tracking-[0.14em] uppercase",
        TONES[kind],
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {kind}
    </span>
  );
};

export default UpdateKindTag;
