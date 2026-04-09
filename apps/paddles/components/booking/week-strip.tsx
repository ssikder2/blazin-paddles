"use client";

import { addDays, addWeeks, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function formatWeekRangeLabel(weekStart: Date, weekEnd: Date): string {
  const sy = weekStart.getFullYear();
  const ey = weekEnd.getFullYear();
  const startMd = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
  const endMd = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
  if (sy !== ey) {
    return `${startMd}/${sy} - ${endMd}/${ey}`;
  }
  return `${startMd} - ${endMd}`;
}

interface WeekStripProps {
  onWeekChange: (next: Date) => void;
  weekStart: Date;
}

export function WeekStrip({ weekStart, onWeekChange }: WeekStripProps) {
  const weekEnd = addDays(weekStart, 6);
  const rangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const today = new Date();
  const viewMonth = weekStart.getMonth();
  const viewYear = weekStart.getFullYear();
  const yearLo = Math.min(today.getFullYear() - 2, viewYear);
  const yearHi = Math.max(today.getFullYear() + 4, viewYear);
  const yearOptions = Array.from(
    { length: yearHi - yearLo + 1 },
    (_, i) => yearLo + i
  );

  const goToMonthYear = (monthIndex: number, year: number) => {
    onWeekChange(
      startOfWeek(new Date(year, monthIndex, 1), { weekStartsOn: 0 })
    );
  };

  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const viewingCurrentWeek = isSameDay(weekStart, currentWeekStart);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <label className="sr-only" htmlFor="week-strip-month">
          Month
        </label>
        <select
          className={cn(
            "cursor-pointer rounded-md border border-[var(--color-border)] bg-white px-3 py-2 pr-8 text-sm shadow-sm",
            "text-foreground hover:bg-[var(--color-muted)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-blue)] focus-visible:outline-offset-2"
          )}
          id="week-strip-month"
          onChange={(e) => {
            goToMonthYear(Number(e.target.value), viewYear);
          }}
          value={viewMonth}
        >
          {MONTHS.map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="week-strip-year">
          Year
        </label>
        <select
          className={cn(
            "cursor-pointer rounded-md border border-[var(--color-border)] bg-white px-3 py-2 pr-8 text-sm shadow-sm",
            "text-foreground tabular-nums hover:bg-[var(--color-muted)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-blue)] focus-visible:outline-offset-2"
          )}
          id="week-strip-year"
          onChange={(e) => {
            goToMonthYear(viewMonth, Number(e.target.value));
          }}
          value={viewYear}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          className={cn(
            "rounded-md border border-transparent px-3 py-2 text-[var(--color-accent-blue)] text-sm underline-offset-4 hover:underline",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-blue)] focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:no-underline"
          )}
          disabled={viewingCurrentWeek}
          onClick={() => onWeekChange(new Date())}
          type="button"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <button
          aria-label="Previous week"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-white shadow-sm",
            "text-foreground hover:bg-[var(--color-muted)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-blue)] focus-visible:outline-offset-2"
          )}
          onClick={() => onWeekChange(addWeeks(weekStart, -1))}
          type="button"
        >
          <ChevronLeft aria-hidden className="size-5" strokeWidth={2} />
        </button>

        <p
          aria-live="polite"
          className="min-w-0 px-2 text-center font-semibold text-base text-foreground tabular-nums sm:text-lg"
        >
          {rangeLabel}
        </p>

        <button
          aria-label="Next week"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-white shadow-sm",
            "text-foreground hover:bg-[var(--color-muted)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-blue)] focus-visible:outline-offset-2"
          )}
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          type="button"
        >
          <ChevronRight aria-hidden className="size-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
