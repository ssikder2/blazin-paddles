import { addDays, addMinutes, setHours, setMinutes, startOfWeek } from "date-fns";

import type { CourtBooking } from "@/types/booking";

/** Seed demo bookings around the current week in local time. */
export function createSeedBookings(now: Date = new Date()): CourtBooking[] {
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const monday = addDays(weekStart, 1);

  const block = (day: Date, h: number, m: number, durationMinutes: number): Omit<CourtBooking, "id"> => {
    const start = setMinutes(setHours(new Date(day), h), m);
    const end = addMinutes(start, durationMinutes);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  return [
    { ...block(monday, 9, 0, 120), id: "seed-1" },
    { ...block(addDays(weekStart, 3), 12, 0, 90), id: "seed-2" },
    { ...block(addDays(weekStart, 5), 15, 30, 120), id: "seed-3" },
  ];
}
