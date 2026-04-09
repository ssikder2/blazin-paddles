import type { SupabaseClient } from "@supabase/supabase-js";

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
