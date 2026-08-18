"use client";

import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Contrast, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_TEXT_SIZE,
  STORAGE_KEYS,
  TEXT_SIZES,
  TEXT_SIZE_LABELS,
  type TextSize,
} from "@/lib/a11y";

const SIZE_SAMPLE: Record<TextSize, string> = {
  compact: "text-[0.6875rem]",
  normal: "text-sm",
  large: "text-base",
  xlarge: "text-lg",
};

/**
 * Carried over from the civic direction and restyled. A minimal aesthetic leans
 * on small type and grey text, which makes reader-side control over size and
 * contrast more necessary here, not less.
 */
const AccessibilityControls = () => {
  const [textSize, setTextSize] = useState<TextSize>(DEFAULT_TEXT_SIZE);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const applied = root.getAttribute("data-text-size");
    if (applied && (TEXT_SIZES as readonly string[]).includes(applied)) {
      setTextSize(applied as TextSize);
    }
    setHighContrast(root.classList.contains("hc"));
  }, []);

  const applyTextSize = useCallback((next: TextSize) => {
    setTextSize(next);
    const root = document.documentElement;
    // The default is the absence of the attribute.
    if (next === DEFAULT_TEXT_SIZE) root.removeAttribute("data-text-size");
    else root.setAttribute("data-text-size", next);
    try {
      localStorage.setItem(STORAGE_KEYS.textSize, next);
    } catch {
      /* private browsing — the preference just won't persist */
    }
  }, []);

  const toggleContrast = useCallback(() => {
    setHighContrast((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("hc", next);
      try {
        localStorage.setItem(STORAGE_KEYS.contrast, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-g-300 px-3.5 text-[0.8125rem] font-medium text-g-700 transition-colors hover:border-ink hover:text-ink"
        aria-label="Display and accessibility options"
      >
        <Type className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Display</span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[17rem] p-0">
        <div className="px-4 pt-4 pb-3">
          <p className="font-serif text-[1.0625rem] text-ink">Display options</p>
          <p className="mt-0.5 text-[0.8125rem] text-g-600">Remembered on this device.</p>
        </div>

        <div className="rule mx-4" />

        <fieldset className="px-4 py-3.5">
          <legend className="label-xs mb-2.5">Text size</legend>
          <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Text size">
            {TEXT_SIZES.map((size) => {
              const selected = textSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => applyTextSize(size)}
                  className={cn(
                    "flex h-[3.25rem] flex-col items-center justify-center gap-1 rounded-md border px-1 transition-colors",
                    selected
                      ? "border-ink bg-ink text-white"
                      : "border-g-300 bg-white text-g-700 hover:border-g-500",
                  )}
                >
                  <span className={cn("font-serif leading-none", SIZE_SAMPLE[size])}>Aa</span>
                  <span className="text-[0.5625rem] leading-none tracking-tight">
                    {TEXT_SIZE_LABELS[size]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="rule mx-4" />

        <div className="px-4 py-3.5">
          <button
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={toggleContrast}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-g-600" aria-hidden="true" />
              <span className="text-[0.9375rem] text-ink">High contrast</span>
            </span>
            {/* Pill switch, in keeping with the rest of the controls */}
            <span
              className={cn(
                "relative h-6 w-10 shrink-0 rounded-pill border transition-colors",
                highContrast ? "border-ink bg-ink" : "border-g-300 bg-g-100",
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "absolute top-[3px] flex h-4 w-4 items-center justify-center rounded-pill bg-white transition-all duration-200",
                  highContrast ? "left-[19px]" : "left-[3px]",
                )}
              >
                {highContrast && <Check className="h-2.5 w-2.5 text-ink" strokeWidth={4} />}
              </span>
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AccessibilityControls;
