export interface CourtBooking {
  /** Supabase user id of who booked; omit on legacy stored rows */
  bookedByUserId?: string;
  end: string;
  id: string;
  /** ISO 8601 instant */
  start: string;
}
