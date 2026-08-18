import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar in the editorial language: serif month caption, circular day cells,
 * ink fill for the selected day, and a ring for today. Cells are 2.25rem so they
 * clear the 24px minimum target and scale with reader text size.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        caption: "relative flex items-center justify-center pt-0.5",
        caption_label: "font-serif text-[1.125rem] tracking-[-0.012em] text-ink",
        nav: "flex items-center",
        nav_button:
          "inline-flex h-8 w-8 items-center justify-center rounded-pill border border-g-300 text-g-700 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-35",
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "w-9 text-[0.625rem] font-semibold tracking-[0.1em] text-g-600 uppercase",
        row: "mt-1 flex w-full",
        cell: "relative h-9 w-9 p-0 text-center focus-within:z-10",
        day: "inline-flex h-9 w-9 items-center justify-center rounded-pill text-[0.875rem] tabular-nums text-ink transition-colors hover:bg-g-100 aria-selected:opacity-100",
        day_selected:
          "bg-ink font-medium text-white hover:bg-ink focus:bg-ink",
        /* Today gets a ring rather than a fill, so it never competes with the
           selected day for meaning. */
        day_today: "ring-1 ring-inset ring-g-400 font-medium",
        day_outside: "text-g-400",
        /* Muted rather than struck through: a whole half-month of strikes
           dominates the grid. react-day-picker still marks these aria-disabled,
           so the state is announced regardless of how it looks. */
        day_disabled: "text-g-300 hover:bg-transparent",
        day_hidden: "invisible",
        day_range_end: "day-range-end",
        day_range_middle: "rounded-none aria-selected:bg-g-100 aria-selected:text-ink",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" aria-hidden="true" />,
        IconRight: () => <ChevronRight className="h-4 w-4" aria-hidden="true" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
