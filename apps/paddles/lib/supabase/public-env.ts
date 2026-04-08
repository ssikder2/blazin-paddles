/**
 * Vercel’s Supabase integration often sets `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
 * The browser needs `NEXT_PUBLIC_*`; `next.config.ts` also maps these for the client bundle.
 */
export function getSupabaseUrl(): string | undefined {
  const v =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  return v || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const v =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();
  return v || undefined;
}
