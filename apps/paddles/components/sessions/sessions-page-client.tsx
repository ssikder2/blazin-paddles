"use client";

import { parseISO } from "date-fns";
import Link from "next/link";

import { sortBookingsUpcoming } from "@/lib/booking-helpers";
import { durationMinutesToCredits } from "@/lib/credits";
import { DEFAULT_CREDITS } from "@/lib/profile";
import { formatDayLabel, formatTimeShort } from "@/lib/timezone";
import { useAuth } from "@/providers/auth-provider";
import { useBookings } from "@/providers/bookings-provider";
import type { CourtBooking } from "@/types/booking";

const VENUE = "Blazin' Paddles — Main Court";

function estimateCredits(booking: CourtBooking): number {
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);
  const minutes = (end.getTime() - start.getTime()) / 60_000;
  return durationMinutesToCredits(minutes);
}

/** Approximate slot indices for display when mapping ISO range to grid (local). */
function bookingDisplayTime(booking: CourtBooking): {
  label: string;
  range: string;
} {
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);
  return {
    label: formatDayLabel(start),
    range: `${formatTimeShort(start)} – ${formatTimeShort(end)}`,
  };
}

export function SessionsPageClient() {
  const { user } = useAuth();
  const { bookings } = useBookings();

  const upcoming = sortBookingsUpcoming(bookings).filter(
    (b) => user && b.bookedByUserId === user.id && parseISO(b.end) > new Date()
  );
  const budget = DEFAULT_CREDITS;
  const remain = user?.credits ?? 0;
  const used = user ? budget - remain : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-semibold text-2xl tracking-tight">
        My sessions
      </h1>

      <section className="mb-10">
        <h2 className="mb-3 font-medium text-[var(--color-muted-foreground)] text-sm uppercase tracking-wide">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)] text-sm">
            No upcoming sessions.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((b) => {
              const { label, range } = bookingDisplayTime(b);
              const credits = estimateCredits(b);
              return (
                <li
                  className="flex items-stretch justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
                  key={b.id}
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      {VENUE}
                    </p>
                    <p className="mt-1 text-sm">{range}</p>
                  </div>
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--color-accent-orange)] text-center font-semibold text-white text-xs leading-tight">
                    <span>{credits}</span>
                    <span className="font-normal opacity-90">credits</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-medium text-[var(--color-muted-foreground)] text-sm uppercase tracking-wide">
          Credit balance
        </h2>
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm">
              {budget} credit budget
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm">
              {used.toFixed(1)} credits used
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent-orange-muted)] px-4 py-3 font-medium text-sm">
              {remain} credits remain
            </div>
          </div>
        ) : (
          <p className="text-[var(--color-muted-foreground)] text-sm">
            Sign in to see your credit balance.
          </p>
        )}
      </section>

      <Link
        className="flex w-full items-center justify-center rounded-xl bg-[var(--color-accent-green)] py-4 font-semibold text-white shadow-sm transition hover:opacity-95"
        href="/book"
      >
        Book a court
      </Link>
    </div>
  );
}
