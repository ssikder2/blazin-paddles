import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourtBooking } from "@/types/booking";

export const DEFAULT_CREDITS = 10;

export async function fetchProfileCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: rpcData, error: rpcError } =
    await supabase.rpc("get_my_credits");
  if (!rpcError && rpcData != null) {
    return Number(rpcData);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  if (error || data == null) {
    return DEFAULT_CREDITS;
  }
  return Number(data.credits);
}

export type ConsumeCreditsResult =
  | { ok: true; balance: number }
  | { ok: false; code: "insufficient" | "rpc_error"; message: string };

export async function consumeCredits(
  supabase: SupabaseClient,
  amount: number
): Promise<ConsumeCreditsResult> {
  const { data, error } = await supabase.rpc("consume_credits", {
    p_amount: amount,
  });
  if (error) {
    const msg = error.message ?? "";
    const insufficient =
      msg.includes("insufficient_credits") ||
      msg.toLowerCase().includes("insufficient");
    return {
      ok: false,
      code: insufficient ? "insufficient" : "rpc_error",
      message: msg || "Could not update credits",
    };
  }
  if (data == null) {
    return { ok: false, code: "rpc_error", message: "No balance returned" };
  }
  return { ok: true, balance: Number(data) };
}

export type InsertBookingResult =
  | { ok: true; booking: CourtBooking }
  | { ok: false; message: string };

export async function insertBooking(
  supabase: SupabaseClient,
  userId: string,
  startIso: string,
  endIso: string
): Promise<InsertBookingResult> {
  const { data, error } = await supabase
    .from("court_bookings")
    .insert({ user_id: userId, start_at: startIso, end_at: endIso })
    .select("id, user_id, start_at, end_at")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "Failed to save booking",
    };
  }

  return {
    ok: true,
    booking: {
      id: data.id,
      start: data.start_at,
      end: data.end_at,
      bookedByUserId: data.user_id,
    },
  };
}

export async function fetchBookings(
  supabase: SupabaseClient,
  from: string,
  to: string
): Promise<CourtBooking[]> {
  const { data, error } = await supabase
    .from("court_bookings")
    .select("id, user_id, start_at, end_at")
    .gte("start_at", from)
    .lt("end_at", to)
    .order("start_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    start: row.start_at,
    end: row.end_at,
    bookedByUserId: row.user_id,
  }));
}
