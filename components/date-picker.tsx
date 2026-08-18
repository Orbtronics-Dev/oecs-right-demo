"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id: string;
  /** ISO date, `yyyy-MM-dd`. Empty string means nothing chosen. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Blocks dates after today — an incident cannot have happened tomorrow. */
  disableFuture?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/** Parses `yyyy-MM-dd` as a local date, so the day never shifts by timezone. */
const toDate = (value: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

/**
 * Date picker built on our own Calendar rather than `<input type="date">`.
 *
 * The native control is styled by the browser and the OS, so it ignores this
 * design system entirely and looks different on every platform. It also renders
 * its value in the browser's locale, which for a Caribbean audience means an
 * American reader and a British reader disagree about what 08/15 means. This
 * writes the month out in words instead, which is unambiguous.
 */
const DatePicker = ({
  id,
  value,
  onChange,
  placeholder = "Choose a date",
  disableFuture,
  invalid,
  describedBy,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  const commit = (date?: Date) => {
    onChange(date ? format(date, "yyyy-MM-dd") : "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-md border border-input bg-white px-3 text-left text-base transition-colors",
          "hover:border-ink",
          invalid && "border-2 border-flag",
          className,
        )}
      >
        <span className={cn("truncate", selected ? "text-ink" : "text-g-600")}>
          {selected ? format(selected, "d MMMM yyyy") : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-g-600" aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={commit}
          defaultMonth={selected}
          disabled={disableFuture ? { after: new Date() } : undefined}
          initialFocus
        />

        <div className="flex items-center justify-between gap-3 border-t border-g-200 px-4 py-3">
          <button
            type="button"
            onClick={() => commit(new Date())}
            className="text-[0.8125rem] font-medium text-ink link-quiet"
          >
            Today
          </button>
          {value && (
            <button
              type="button"
              onClick={() => commit(undefined)}
              className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-g-600 transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
