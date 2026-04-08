import { isBefore, isEqual, parseISO } from "date-fns";

import { getSlotBounds, SLOT_COUNT } from "@/lib/slots";
import type { CourtBooking } from "@/types/booking";

export function bookingOverlapsSlot(
  booking: CourtBooking,
  day: Date,
  slotIndex: number
): boolean {
  const { start: slotStart, end: slotEnd } = getSlotBounds(day, slotIndex);
  const bStart = parseISO(booking.start);
  const bEnd = parseISO(booking.end);
  return isBefore(slotStart, bEnd) && isBefore(bStart, slotEnd);
}

export function isSlotBooked(day: Date, slotIndex: number, bookings: CourtBooking[]): boolean {
  return bookings.some((b) => bookingOverlapsSlot(b, day, slotIndex));
}

export function rangeTouchesBooked(
  day: Date,
  startSlot: number,
  endSlot: number,
  bookings: CourtBooking[]
): boolean {
  const lo = Math.min(startSlot, endSlot);
  const hi = Math.max(startSlot, endSlot);
  for (let s = lo; s <= hi; s++) {
    if (isSlotBooked(day, s, bookings)) {
      return true;
    }
  }
  return false;
}

/** Map booking interval to inclusive slot indices for a given calendar day, if any overlap. */
export function bookingToSlotRangeForDay(
  booking: CourtBooking,
  day: Date
): { start: number; end: number } | null {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const bStart = parseISO(booking.start);
  const bEnd = parseISO(booking.end);
  if (!isBefore(bStart, dayEnd) || !isBefore(dayStart, bEnd)) {
    return null;
  }

  let startIdx = -1;
  let endIdx = -1;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const { start: s, end: e } = getSlotBounds(day, i);
    if (isBefore(s, bEnd) && isBefore(bStart, e)) {
      if (startIdx === -1) {
        startIdx = i;
      }
      endIdx = i;
    }
  }
  if (startIdx === -1 || endIdx === -1) {
    return null;
  }
  return { start: startIdx, end: endIdx };
}

export function sortBookingsUpcoming(bookings: CourtBooking[]): CourtBooking[] {
  return [...bookings].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
}

export function isUpcoming(booking: CourtBooking, now: Date = new Date()): boolean {
  return isBefore(now, parseISO(booking.end)) || isEqual(now, parseISO(booking.end));
}
