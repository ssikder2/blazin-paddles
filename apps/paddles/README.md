# Blazin' Paddles

**Live:** [blazin-paddles-ik3mff2nx-ssikder2s-projects.vercel.app/book](https://blazin-paddles-ik3mff2nx-ssikder2s-projects.vercel.app/book)

A full-stack court booking web app for a single-venue padel facility. Users can browse real-time court availability, drag to select a time slot, and confirm bookings using a credit-based system — all without needing to call or email.

## Features

- **Interactive booking calendar** — drag across any open slot to select a time range; the grid prevents selecting already-booked slots
- **Credit-based booking system** — each 30-minute slot costs 1 credit; users start with 10 credits and see their balance update instantly after booking
- **Google OAuth sign-in** — one-click authentication via Supabase Auth; unauthenticated users can browse availability but must sign in to book
- **Persistent bookings** — bookings are saved to a PostgreSQL database and loaded on every visit, so they survive refreshes and show up on any device
- **Overlap prevention** — the database enforces an exclusion constraint so two bookings can never occupy the same time window
- **Timezone-aware** — all times are displayed in the user's local timezone
- **My sessions page** — signed-in users can see their upcoming bookings and credit balance
- **Deployed on Vercel** — production build with automatic deploys on push

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | [Supabase Auth](https://supabase.com/auth) (Google OAuth) |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| ORM / queries | Supabase JS client with typed queries |
| Deployment | [Vercel](https://vercel.com) |
| Monorepo | [Turborepo](https://turborepo.com) + npm workspaces |

## How It Works

### Booking flow
1. User visits `/book` and sees the week calendar grid
2. User clicks and drags across open slots to select a time range
3. A booking panel slides in showing the time, credit cost, and remaining balance
4. On confirm: credits are atomically deducted via a Supabase RPC function, then the booking is inserted into the `court_bookings` table
5. The calendar updates immediately and the new slot shows as booked for all users

### Credit system
- Credits are stored in a `profiles` table, one row per auth user
- The `consume_credits` SQL function deducts atomically — if balance is insufficient it raises an exception before any deduction happens, preventing race conditions
- A new profile with 10 starting credits is automatically created on first sign-in via a Postgres trigger on `auth.users`

### Database schema
```
profiles          — user credit balances (linked to auth.users)
court_bookings    — all bookings with start_at / end_at timestamps + overlap exclusion constraint
```

### Row Level Security
- Any authenticated user can read all bookings (needed to render the shared calendar)
- Users can only insert or delete their own bookings
- Users can only read and update their own profile

## Project Structure

```
apps/paddles/
├── app/
│   ├── auth/callback/    # OAuth callback handler
│   ├── book/             # Main booking calendar page
│   └── sessions/         # My sessions + credit balance page
├── components/
│   ├── booking/          # TimeGrid, WeekStrip, BookingPanel, BookingPageClient
│   └── layout/           # SiteHeader, SiteFooter
├── lib/
│   ├── credits.ts         # Credit calculation logic
│   ├── profile.ts         # Supabase queries: credits, bookings
│   ├── slots.ts           # Time slot utilities
│   └── supabase/          # Supabase client (server + client + middleware)
├── providers/
│   ├── auth-provider.tsx  # Auth state + credit patching
│   └── bookings-provider.tsx # Bookings loaded from Supabase
└── supabase/migrations/   # SQL migrations (profiles, RPCs, court_bookings)
```

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project

### Environment variables
Create a `.env.local` in `apps/paddles/`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database setup
Run the migrations in order in the Supabase SQL editor:
```
supabase/migrations/001_profiles.sql
supabase/migrations/002_credit_rpc.sql
supabase/migrations/003_court_bookings.sql
```

### Run locally
```bash
npm install
npm run dev --workspace=paddles
```

Open [http://localhost:3000](http://localhost:3000).
