#!/usr/bin/env node
/**
 * Applies Prisma migrations to your Supabase Postgres database, then runs `prisma generate`.
 *
 * Env:
 * - **Pooled** (for the app & for `prisma generate`): `DATABASE_URL`, or `POSTGRES_PRISMA_URL` / `POSTGRES_URL` from Vercel.
 * - **Direct** (for `prisma migrate deploy`): `DIRECT_URL`, or `POSTGRES_URL_NON_POOLING`. Migrations run with this URL
 *   so they are not executed through PgBouncer transaction pooling (recommended by Supabase + Prisma).
 *
 * Loads, in order: monorepo-root `.env.local`, `.env`, then `packages/database/.env`.
 */

import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePkgRoot = resolve(__dirname, "..");
const monorepoRoot = resolve(databasePkgRoot, "../..");

for (const file of [
  resolve(monorepoRoot, ".env.local"),
  resolve(monorepoRoot, ".env"),
  resolve(databasePkgRoot, ".env"),
]) {
  config({ path: file, override: false });
}

const pooled =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";

const direct =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  pooled;

if (!pooled) {
  console.error(
    "Missing connection string. Set DATABASE_URL or POSTGRES_PRISMA_URL (Vercel Supabase integration)."
  );
  process.exit(1);
}

try {
  execSync("npm run db:migrate", {
    cwd: databasePkgRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: direct,
    },
  });
} catch {
  process.exit(1);
}

console.log("Migrations applied. Running prisma generate…");

try {
  execSync("npm run db:generate", {
    cwd: databasePkgRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: pooled,
    },
  });
} catch {
  process.exit(1);
}

console.log("Done.");
