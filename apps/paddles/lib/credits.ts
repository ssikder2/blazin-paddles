/** 1 credit per 30 minutes; minimum charge is one slot. */
export function durationMinutesToCredits(minutes: number): number {
  return Math.max(1, Math.ceil(minutes / 30));
}

export function slotRangeToCredits(startSlot: number, endSlot: number): number {
  const lo = Math.min(startSlot, endSlot);
  const hi = Math.max(startSlot, endSlot);
  const slots = hi - lo + 1;
  return slots;
}
