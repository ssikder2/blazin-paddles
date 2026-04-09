# Blazin' Paddles

A full-stack court booking web application for a padel facility. Users can browse real-time court availability, drag to select a time range, and confirm reservations using a credit-based system — no phone calls or emails needed.

**Live:** [blazin-paddles-chi.vercel.app](https://blazin-paddles-chi.vercel.app) · [apps/paddles docs](./apps/paddles/README.md)

---

## What I Built

Blazin' Paddles is a court reservation platform with the following capabilities:

- **Interactive weekly calendar** — drag across any open slot to select a booking window; booked slots are visually blocked for all users in real time
- **Credit-based booking system** — 1 credit per 30-minute slot; users start with 10 credits and see their balance update after each booking
- **Google OAuth sign-in** — powered by Supabase Auth; guests can view availability but must sign in to book
- **Database-backed persistence** — bookings are stored in PostgreSQL and survive refreshes, logouts, and device changes
- **Overlap prevention** — enforced at the database level with a PostgreSQL exclusion constraint (no two bookings can overlap)
- **Atomic credit deduction** — a PostgreSQL RPC function deducts credits and rejects the request if balance is insufficient, preventing race conditions
- **My sessions page** — signed-in users see their upcoming bookings and remaining credit balance
- **Deployed to Vercel** — continuous deployment from GitHub with per-app Vercel projects in a monorepo

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, server components, server actions |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | [Supabase Auth](https://supabase.com/auth) — Google OAuth, server-side session handling |
| Database | PostgreSQL via [Supabase](https://supabase.com) — RLS policies, triggers, RPC functions |
| Deployment | [Vercel](https://vercel.com) |
| Monorepo | [Turborepo](https://turborepo.com) + npm workspaces |
| Observability | Sentry (optional), BetterStack |

---

## Project Structure

This is a Turborepo monorepo. The main application lives in `apps/paddles`.

```
blazin-paddles/
├── apps/
│   ├── paddles/          # The court booking app (main product)
│   ├── api/              # Serverless API app
│   ├── app/              # Auth-gated Next.js app (next-forge base)
│   └── web/              # Marketing site (next-forge base)
└── packages/
    ├── database/         # Prisma schema + compiled DB client
    ├── auth/             # Auth keys and shared config
    ├── next-config/      # Shared Next.js config
    ├── observability/    # Sentry + BetterStack integration
    └── design-system/    # Shared UI components
```

See [apps/paddles/README.md](./apps/paddles/README.md) for the full breakdown of the booking app.

---

## Architecture Decisions

**Monorepo with Turborepo** — shared packages (database client, Next.js config, environment validation) are built once and consumed by multiple apps. Turborepo caches build outputs so only affected packages rebuild on each push.

**Supabase for auth + database** — the same Supabase project handles Google OAuth session management and the PostgreSQL database. Row Level Security policies enforce authorization at the data layer so the API never has to manually filter by user.

**Database-level overlap prevention** — instead of checking for conflicts in application code, a PostgreSQL `EXCLUDE USING GIST` constraint makes it physically impossible for two overlapping bookings to coexist. This works even under concurrent requests.

**Atomic credit deduction via RPC** — the `consume_credits` Postgres function runs inside a transaction. If the user doesn't have enough credits, the function raises an exception before making any changes. This prevents partial updates without needing application-level locking.

**Compiled database package** — the `@repo/database` package is compiled to JavaScript (`dist/`) after Prisma generates its client. This avoids Turbopack/webpack resolution issues with Prisma's generated `.ts` → `.js` imports in a monorepo context.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Google OAuth enabled

### Install dependencies

```bash
npm install
```

### Set up environment variables

Copy the example and fill in your Supabase credentials:

```bash
cp apps/paddles/.env.example apps/paddles/.env.local
```

### Run the database migrations

Run each migration in order in the Supabase SQL editor:

```
apps/paddles/supabase/migrations/001_profiles.sql
apps/paddles/supabase/migrations/002_credit_rpc.sql
apps/paddles/supabase/migrations/003_court_bookings.sql
```

### Start the dev server

```bash
npm run dev --workspace=paddles
```

Open [http://localhost:3000](http://localhost:3000).

---

## License

MIT
