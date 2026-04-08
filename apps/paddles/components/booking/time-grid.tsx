"use client";

import { useCallback, useRef, useState } from "react";

import { isSlotBooked, rangeTouchesBooked } from "@/lib/booking-helpers";
import { cn } from "@/lib/cn";
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
  const dragRef = useRef<DragState | null>(null);
  const pointerUpRef = useRef<(() => void) | null>(null);

  const commitDrag = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current) {
      return;
    }
    const day = days[current.dayIndex];
    const lo = Math.min(current.startSlot, current.endSlot);
    const hi = Math.max(current.startSlot, current.endSlot);
    if (rangeTouchesBooked(day, lo, hi, bookings)) {
      onInvalidRange?.();
      return;
    }
    onCommitRange({ dayIndex: current.dayIndex, startSlot: lo, endSlot: hi });
  }, [bookings, days, onCommitRange, onInvalidRange]);

  const handlePointerDown = useCallback(
    (dayIndex: number, slotIndex: number, booked: boolean) => {
      if (booked) {
        return;
      }
      if (pointerUpRef.current) {
        window.removeEventListener("pointerup", pointerUpRef.current);
        pointerUpRef.current = null;
      }
      const next: DragState = { dayIndex, startSlot: slotIndex, endSlot: slotIndex };
      dragRef.current = next;
      setDrag(next);

      const onUp = () => {
        window.removeEventListener("pointerup", onUp);
        pointerUpRef.current = null;
        commitDrag();
      };
      pointerUpRef.current = onUp;
      window.addEventListener("pointerup", onUp);
    },
    [commitDrag]
  );

  const handlePointerEnter = useCallback((dayIndex: number, slotIndex: number) => {
    setDrag((prev) => {
      if (!prev || prev.dayIndex !== dayIndex) {
        return prev;
      }
      const next = { ...prev, endSlot: slotIndex };
      dragRef.current = next;
      return next;
    });
  }, []);

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
          <div className="contents" key={`row-${slotIndex}`}>
            <div className="sticky left-0 z-10 border-[var(--color-border)] border-b bg-[var(--color-muted)] px-2 py-0 text-right text-[var(--color-muted-foreground)] text-xs leading-[2rem] tabular-nums">
              {formatTimeShort(getSlotBounds(days[0], slotIndex).start)}
            </div>
            {days.map((day, dayIndex) => {
              const booked = isSlotBooked(day, slotIndex, bookings);
              const highlighted = isInHighlight(dayIndex, slotIndex);

              return (
                <button
                  className={cn(
                    "relative h-8 border-[var(--color-border)] border-b border-l text-left text-xs transition-colors select-none",
                    booked && "cursor-not-allowed bg-[var(--color-booked)] text-[var(--color-booked-text)]",
                    !booked && "cursor-ns-resize bg-white hover:bg-[var(--color-accent-orange-muted)]/40",
                    highlighted && !booked && "bg-[var(--color-accent-orange)]/25 ring-1 ring-[var(--color-accent-orange)] ring-inset"
                  )}
                  disabled={booked}
                  key={`${day.toISOString()}-${slotIndex}`}
                  onPointerDown={() => handlePointerDown(dayIndex, slotIndex, booked)}
                  onPointerEnter={() => handlePointerEnter(dayIndex, slotIndex)}
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
