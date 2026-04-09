import { isBefore, parseISO } from "date-fns";

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

export function getBookingAtSlot(
  day: Date,
  slotIndex: number,
  bookings: CourtBooking[]
): CourtBooking | null {
  for (const b of bookings) {
    if (bookingOverlapsSlot(b, day, slotIndex)) {
      return b;
    }
  }
  return null;
}

export function isSlotBooked(
  day: Date,
  slotIndex: number,
  bookings: CourtBooking[]
): boolean {
  return getBookingAtSlot(day, slotIndex, bookings) !== null;
}

export type DaySlotSegment =
  | { type: "free"; startSlot: number; endSlot: number }
  | {
      type: "booked";
      startSlot: number;
      endSlot: number;
      booking: CourtBooking;
    };

export function getDaySlotSegments(
  day: Date,
  bookings: CourtBooking[]
): DaySlotSegment[] {
  const segments: DaySlotSegment[] = [];
  let i = 0;
  while (i < SLOT_COUNT) {
    const booking = getBookingAtSlot(day, i, bookings);
    if (booking) {
      let j = i + 1;
      while (j < SLOT_COUNT) {
        const next = getBookingAtSlot(day, j, bookings);
        if (next?.id !== booking.id) {
          break;
        }
        j++;
      }
      segments.push({ type: "booked", startSlot: i, endSlot: j - 1, booking });
      i = j;
    } else {
      let j = i + 1;
      while (j < SLOT_COUNT && !getBookingAtSlot(day, j, bookings)) {
        j++;
      }
      segments.push({ type: "free", startSlot: i, endSlot: j - 1 });
      i = j;
    }
  }
  return segments;
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
  return [...bookings].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
}
