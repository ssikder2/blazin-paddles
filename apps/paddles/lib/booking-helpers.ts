import { isBefore, parseISO } from "date-fns";

import { getSlotBounds } from "@/lib/slots";
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

export function sortBookingsUpcoming(bookings: CourtBooking[]): CourtBooking[] {
  return [...bookings].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
}
