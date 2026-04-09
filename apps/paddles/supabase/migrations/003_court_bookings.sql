-- Court bookings table — persists bookings so they survive across sessions/devices.

create table if not exists public.court_bookings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint no_overlap exclude using gist (
    tstzrange(start_at, end_at, '[)') with &&
  )
);

alter table public.court_bookings enable row level security;

-- Anyone authenticated can see all bookings (needed to render the calendar)
drop policy if exists "Authenticated users can read all bookings" on public.court_bookings;
create policy "Authenticated users can read all bookings"
  on public.court_bookings
  for select
  to authenticated
  using (true);

-- Users can only insert their own bookings
drop policy if exists "Users can insert own bookings" on public.court_bookings;
create policy "Users can insert own bookings"
  on public.court_bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own bookings
drop policy if exists "Users can delete own bookings" on public.court_bookings;
create policy "Users can delete own bookings"
  on public.court_bookings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Indexes for calendar range queries
create index if not exists idx_court_bookings_start_at on public.court_bookings (start_at);
create index if not exists idx_court_bookings_user_id  on public.court_bookings (user_id);
