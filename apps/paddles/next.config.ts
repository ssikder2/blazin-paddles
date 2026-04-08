import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

/**
 * Next only auto-loads `.env*` from the app directory. Merge parent / monorepo `.env*` files
 * into `process.env` without using `loadEnvConfig` twice: a second call with `forceReload`
 * resets env to the pre-load snapshot and drops variables from earlier directories.
 *
 * Order: outer dirs first, then app dir; within each dir, `.env` then `.env.local` (later wins).
 */
function loadEnvFromAncestors() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "..", ".."),
    path.resolve(cwd, "..", ".."),
    cwd,
  ];
  for (const dir of candidates) {
    const envPath = path.join(dir, ".env");
    const localPath = path.join(dir, ".env.local");
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath, override: true });
    }
    if (existsSync(localPath)) {
      loadDotenv({ path: localPath, override: true });
    }
  }
}

loadEnvFromAncestors();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Map Vercel Supabase integration names into what the client bundle reads. */
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
  },
};

export default nextConfig;
