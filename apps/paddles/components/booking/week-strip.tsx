"use client";

import { addWeeks, isSameDay } from "date-fns";

import { cn } from "@/lib/cn";
import { formatDayLabel } from "@/lib/timezone";
import { getWeekDays } from "@/lib/slots";

type WeekStripProps = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
};

export function WeekStrip({ weekStart, onWeekChange }: WeekStripProps) {
  const days = getWeekDays(weekStart);
  const today = new Date();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
          onClick={() => onWeekChange(addWeeks(weekStart, -1))}
          type="button"
        >
          ← Prev
        </button>
        <button
          className="rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          type="button"
        >
          Next →
        </button>
        <button
          className="rounded-md border border-transparent px-3 py-1.5 text-[var(--color-accent-blue)] text-sm underline-offset-4 hover:underline"
          onClick={() => onWeekChange(new Date())}
          type="button"
        >
          Today
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center rounded-lg px-2 py-2 text-center text-sm",
                isToday && "bg-[var(--color-accent-blue)] text-white shadow-sm"
              )}
              key={d.toISOString()}
            >
              <span className={cn("text-xs", isToday ? "text-white/90" : "text-[var(--color-muted-foreground)]")}>
                {new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d)}
              </span>
              <span className="font-medium tabular-nums">{formatDayLabel(d)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
