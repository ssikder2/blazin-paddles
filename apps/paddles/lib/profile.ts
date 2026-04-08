import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_CREDITS = 10;

export async function fetchProfileCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
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
