"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { rangeTouchesBooked } from "@/lib/booking-helpers";
import { formatTimeShort } from "@/lib/timezone";
import { getSlotBounds, getWeekDays, SLOT_COUNT } from "@/lib/slots";
import type { CourtBooking } from "@/types/booking";

type DragState = {
  dayIndex: number;
  startSlot: number;
  endSlot: number;
};

type TimeGridProps = {
  weekStart: Date;
  bookings: CourtBooking[];
  /** Live selection while dragging or after commit (for panel) */
  previewSelection: { dayIndex: number; startSlot: number; endSlot: number } | null;
  onCommitRange: (payload: { dayIndex: number; startSlot: number; endSlot: number }) => void;
  onInvalidRange?: () => void;
};

export function TimeGrid({
  weekStart,
  bookings,
  previewSelection,
  onCommitRange,
  onInvalidRange,
}: TimeGridProps) {
  const days = getWeekDays(weekStart);
  const [drag, setDrag] = useState<DragState | null>(null);

  const updateDragEnd = useCallback((dayIndex: number, slotIndex: number) => {
    setDrag((d) => {
      if (!d || d.dayIndex !== dayIndex) {
        return d;
      }
      return { ...d, endSlot: slotIndex };
    });
  }, []);

  useEffect(() => {
    if (!drag) {
      return;
    }
    const handleUp = () => {
      const { dayIndex, startSlot, endSlot } = drag;
      const day = days[dayIndex];
      const lo = Math.min(startSlot, endSlot);
      const hi = Math.max(startSlot, endSlot);
      setDrag(null);
      if (rangeTouchesBooked(day, lo, hi, bookings)) {
        onInvalidRange?.();
        return;
      }
      onCommitRange({ dayIndex, startSlot: lo, endSlot: hi });
    };
    window.addEventListener("pointerup", handleUp);
    return () => window.removeEventListener("pointerup", handleUp);
  }, [drag, days, bookings, onCommitRange, onInvalidRange]);

  const activeHighlight = drag ?? previewSelection;

  const isInHighlight = (dayIndex: number, slotIndex: number) => {
    if (!activeHighlight || activeHighlight.dayIndex !== dayIndex) {
      return false;
    }
    const lo = Math.min(activeHighlight.startSlot, activeHighlight.endSlot);
    const hi = Math.max(activeHighlight.startSlot, activeHighlight.endSlot);
    return slotIndex >= lo && slotIndex <= hi;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
      <div
        className="grid min-w-[720px]"
        style={{
          gridTemplateColumns: `4.5rem repeat(7, minmax(0, 1fr))`,
        }}
      >
        <div className="sticky left-0 z-20 border-[var(--color-border)] border-b bg-white p-2" />
        {days.map((d) => (
          <div
            className="border-[var(--color-border)] border-b border-l p-2 text-center font-medium text-sm"
            key={d.toISOString()}
          >
            {new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d)}
          </div>
        ))}

        {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed slot rows
          <div className="contents" key={slotIndex}>
            <div className="sticky left-0 z-10 border-[var(--color-border)] border-b bg-[var(--color-muted)] px-2 py-0 text-right text-[var(--color-muted-foreground)] text-xs leading-[2rem] tabular-nums">
              {formatTimeShort(getSlotBounds(days[0], slotIndex).start)}
            </div>
            {days.map((day, dayIndex) => {
              const booked = rangeTouchesBooked(day, slotIndex, slotIndex, bookings);
              const highlighted = isInHighlight(dayIndex, slotIndex);

              return (
                <button
                  className={cn(
                    "relative h-8 border-[var(--color-border)] border-b border-l text-left text-xs transition-colors",
                    booked && "cursor-not-allowed bg-[var(--color-booked)] text-[var(--color-booked-text)]",
                    !booked && "cursor-ns-resize bg-white hover:bg-[var(--color-accent-orange-muted)]/40",
                    highlighted && !booked && "bg-[var(--color-accent-orange)]/25 ring-1 ring-[var(--color-accent-orange)] ring-inset"
                  )}
                  disabled={booked}
                  key={`${day.toISOString()}-${slotIndex}`}
                  onPointerDown={(e) => {
                    if (booked) {
                      return;
                    }
                    e.preventDefault();
                    setDrag({ dayIndex, startSlot: slotIndex, endSlot: slotIndex });
                  }}
                  onPointerEnter={() => updateDragEnd(dayIndex, slotIndex)}
                  type="button"
                >
                  {booked ? (
                    <span className="flex h-full items-center justify-center px-1 text-[10px] leading-tight">
                      Booked
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
