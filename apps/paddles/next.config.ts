import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

/** Next only auto-loads .env from this app dir; also check monorepo / workspace roots. */
function loadEnvFromAncestors() {
  const cwd = process.cwd();
  const candidates = [
    cwd,
    path.resolve(cwd, "..", ".."),
    path.resolve(cwd, "..", "..", ".."),
  ];
  for (const dir of candidates) {
    if (existsSync(path.join(dir, ".env.local"))) {
      loadEnvConfig(dir);
      return;
    }
  }
  for (const dir of candidates) {
    if (existsSync(path.join(dir, ".env"))) {
      loadEnvConfig(dir);
      return;
    }
  }
  loadEnvConfig(cwd);
}

loadEnvFromAncestors();

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
