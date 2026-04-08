import { addDays, startOfWeek } from "date-fns";

/** First slot starts at 7:00; last slot starts at 21:30 (ends 22:00). */
export const SLOT_COUNT = 30;
export const START_HOUR = 7;
export const END_HOUR = 22;

export function getWeekStart(anchor: Date, weekStartsOn: 0 | 1 = 0): Date {
  return startOfWeek(anchor, { weekStartsOn });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function getSlotBounds(day: Date, slotIndex: number): { start: Date; end: Date } {
  const start = new Date(day);
  start.setHours(START_HOUR, 0, 0, 0);
  start.setMinutes(start.getMinutes() + slotIndex * 30);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end };
}

export function slotIndicesOverlapRange(
  startSlot: number,
  endSlot: number,
  bookedStartSlot: number,
  bookedEndSlot: number
): boolean {
  const a0 = Math.min(startSlot, endSlot);
  const a1 = Math.max(startSlot, endSlot);
  const b0 = Math.min(bookedStartSlot, bookedEndSlot);
  const b1 = Math.max(bookedStartSlot, bookedEndSlot);
  return a0 <= b1 && a1 >= b0;
}
