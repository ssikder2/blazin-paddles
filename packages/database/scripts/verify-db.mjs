#!/usr/bin/env node
/**
 * Quick connection check: SELECT 1 via pg using the same URL strategy as setup-db.mjs.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { Pool } from "pg";

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

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!url) {
  console.error("No DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL found.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
try {
  const r = await pool.query("SELECT 1 AS ok");
  console.log("Connected:", r.rows[0]);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await pool.end();
}
