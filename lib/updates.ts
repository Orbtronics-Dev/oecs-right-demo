import { updates, type Update, type UpdateKind } from "@/data/mockData";

/** Words per minute used for the reading estimate — a deliberately calm pace. */
const WPM = 190;

export const allUpdates = (): Update[] =>
  [...updates].sort((a, b) => b.date.localeCompare(a.date));

export const findUpdate = (slug: string): Update | undefined =>
  updates.find((update) => update.slug === slug);

/**
 * Derived from the actual body text rather than stored, so it cannot drift out
 * of sync with the article when the copy is edited.
 */
export const readingMinutes = (update: Update): number => {
  const words = update.body.reduce((total, block) => {
    const text =
      block.type === "list"
        ? block.items.join(" ")
        : block.type === "note"
          ? `${block.title ?? ""} ${block.text}`
          : block.type === "quote"
            ? `${block.text} ${block.attribution}`
            : block.text;
    return total + text.trim().split(/\s+/).length;
  }, update.summary.trim().split(/\s+/).length);

  return Math.max(1, Math.round(words / WPM));
};

/** Previous/next in reverse-chronological order, for article footers. */
export const adjacentUpdates = (slug: string) => {
  const list = allUpdates();
  const index = list.findIndex((update) => update.slug === slug);
  return {
    newer: index > 0 ? list[index - 1] : undefined,
    older: index >= 0 && index < list.length - 1 ? list[index + 1] : undefined,
  };
};

export const formatUpdateDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Plural forms written out — "Guidance" is a mass noun and has no "-s". */
const PLURALS: Record<UpdateKind, string> = {
  "Safety alert": "safety alerts",
  "Price notice": "price notices",
  Guidance: "guidance",
  Event: "events",
};

export const kindPlural = (kind: UpdateKind) => PLURALS[kind];

/** Every kind that actually appears, in a stable display order. */
const KIND_ORDER: UpdateKind[] = ["Safety alert", "Price notice", "Guidance", "Event"];

export const usedKinds = (): UpdateKind[] =>
  KIND_ORDER.filter((kind) => updates.some((update) => update.kind === kind));
