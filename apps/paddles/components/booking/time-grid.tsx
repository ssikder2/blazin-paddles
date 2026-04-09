"use client";

import { isSameDay } from "date-fns";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";

import { getDaySlotSegments, rangeTouchesBooked } from "@/lib/booking-helpers";
import { cn } from "@/lib/cn";
import { getSlotBounds, getWeekDays, SLOT_COUNT } from "@/lib/slots";
import { formatTimeShort } from "@/lib/timezone";
import type { CourtBooking } from "@/types/booking";

const SLOT_REM = 2;

/** Fits typical locale times on one line (whitespace-nowrap) without excess gutter */
const TIME_COL_CLASS = "w-[5.25rem] min-w-[5.25rem] shrink-0";

interface DragState {
  dayIndex: number;
  endSlot: number;
  startSlot: number;
}

interface TimeGridProps {
  bookings: CourtBooking[];
  currentUserId: string | null;
  onCommitRange: (payload: {
    dayIndex: number;
    startSlot: number;
    endSlot: number;
  }) => void;
  onInvalidRange?: () => void;
  previewSelection: {
    dayIndex: number;
    startSlot: number;
    endSlot: number;
  } | null;
  weekStart: Date;
}

export function TimeGrid({
  weekStart,
  bookings,
  currentUserId,
  previewSelection,
  onCommitRange,
  onInvalidRange,
}: TimeGridProps) {
  const days = getWeekDays(weekStart);
  const today = new Date();
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pointerUpRef = useRef<(() => void) | null>(null);

  const segmentsByDay = useMemo(
    () => days.map((d) => getDaySlotSegments(d, bookings)),
    [bookings, days]
  );

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
      const next: DragState = {
        dayIndex,
        startSlot: slotIndex,
        endSlot: slotIndex,
      };
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

  const handlePointerEnter = useCallback(
    (dayIndex: number, slotIndex: number) => {
      setDrag((prev) => {
        if (!prev || prev.dayIndex !== dayIndex) {
          return prev;
        }
        const next = { ...prev, endSlot: slotIndex };
        dragRef.current = next;
        return next;
      });
    },
    []
  );

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
      <div className="flex min-w-[720px] flex-col">
        <div className="flex border-[var(--color-border)] border-b bg-white">
          <div
            className={cn(
              "sticky left-0 z-20 border-[var(--color-border)] border-r bg-white px-1 py-2",
              TIME_COL_CLASS
            )}
          />
          <div className="grid min-w-0 flex-1 grid-cols-7 divide-x divide-[var(--color-border)]">
            {days.map((d) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-1 py-2 text-center",
                    isToday &&
                      "rounded-md bg-[var(--color-accent-orange-muted)] ring-1 ring-[var(--color-accent-orange)]/40 ring-inset"
                  )}
                  key={d.toISOString()}
                >
                  <span
                    className={cn(
                      "font-medium text-xs leading-tight sm:text-sm",
                      isToday && "text-[var(--color-accent-orange)]"
                    )}
                  >
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "long",
                    }).format(d)}
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isToday
                        ? "text-[var(--color-accent-orange)]"
                        : "text-[var(--color-muted-foreground)]"
                    )}
                  >
                    {d.getMonth() + 1}/{d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex">
          <div
            className={cn(
              "sticky left-0 z-10 flex flex-col border-[var(--color-border)] border-r bg-[var(--color-muted)]",
              TIME_COL_CLASS
            )}
          >
            {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
              const slotStart = getSlotBounds(days[0], slotIndex).start;
              return (
                <div
                  className="flex h-8 items-center justify-center whitespace-nowrap border-[var(--color-border)] border-b px-1 text-center text-[var(--color-muted-foreground)] text-xs tabular-nums"
                  key={slotStart.toISOString()}
                >
                  {formatTimeShort(slotStart)}
                </div>
              );
            })}
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-7 divide-x divide-[var(--color-border)]">
            {days.map((day, dayIndex) => (
              <div
                className="flex min-w-0 flex-col bg-white"
                key={day.toISOString()}
              >
                {segmentsByDay[dayIndex].map((seg) => {
                  if (seg.type === "booked") {
                    const slotCount = seg.endSlot - seg.startSlot + 1;
                    const isMine =
                      Boolean(currentUserId) &&
                      seg.booking.bookedByUserId === currentUserId;
                    return (
                      <div
                        className={cn(
                          "flex flex-none cursor-not-allowed select-none items-center justify-center border-[var(--color-border)] border-b px-1 text-center font-medium text-xs",
                          isMine
                            ? "bg-[var(--color-accent-orange)] text-white"
                            : "bg-[var(--color-booked)] text-[var(--color-booked-text)]"
                        )}
                        key={`b-${seg.booking.id}-${seg.startSlot}`}
                        style={{ height: `${slotCount * SLOT_REM}rem` }}
                      >
                        Booked
                      </div>
                    );
                  }

                  return (
                    <Fragment
                      key={`free-${day.toISOString()}-${seg.startSlot}`}
                    >
                      {Array.from(
                        { length: seg.endSlot - seg.startSlot + 1 },
                        (_, k) => {
                          const slotIndex = seg.startSlot + k;
                          const highlighted = isInHighlight(
                            dayIndex,
                            slotIndex
                          );
                          return (
                            <button
                              className={cn(
                                "relative h-8 shrink-0 select-none border-[var(--color-border)] border-b border-l-0 text-left text-xs transition-colors",
                                "cursor-ns-resize bg-white hover:bg-[var(--color-accent-orange-muted)]/40",
                                highlighted &&
                                  "bg-[var(--color-accent-orange)]/25 ring-1 ring-[var(--color-accent-orange)] ring-inset"
                              )}
                              key={`${day.toISOString()}-${slotIndex}`}
                              onPointerDown={() =>
                                handlePointerDown(dayIndex, slotIndex, false)
                              }
                              onPointerEnter={() =>
                                handlePointerEnter(dayIndex, slotIndex)
                              }
                              type="button"
                            />
                          );
                        }
                      )}
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
