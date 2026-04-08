"use client";

import { X } from "lucide-react";

import { slotRangeToCredits } from "@/lib/credits";
import { formatTimeShort } from "@/lib/timezone";
import { getSlotBounds, getWeekDays } from "@/lib/slots";
import { useAuth } from "@/providers/auth-provider";

export type PanelSelection = {
  weekStart: Date;
  dayIndex: number;
  startSlot: number;
  endSlot: number;
};

type BookingPanelProps = {
  selection: PanelSelection | null;
  onClose: () => void;
  onConfirm: (payload: { startIso: string; endIso: string; credits: number }) => void;
};

export function BookingPanel({ selection, onClose, onConfirm }: BookingPanelProps) {
  const { user, signInWithGoogle } = useAuth();
  const open = selection !== null;

  if (!open || !selection) {
    return null;
  }

  const days = getWeekDays(selection.weekStart);
  const day = days[selection.dayIndex];
  const lo = Math.min(selection.startSlot, selection.endSlot);
  const hi = Math.max(selection.startSlot, selection.endSlot);
  const start = getSlotBounds(day, lo).start;
  const end = getSlotBounds(day, hi).end;
  const credits = slotRangeToCredits(lo, hi);
  const remaining = user ? user.credits - credits : null;

  return (
    <>
      <button
        aria-label="Close booking panel"
        className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-[var(--color-border)] border-l bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between bg-neutral-900 px-4 py-4 text-white">
          <h2 className="font-semibold text-lg">Book your court</h2>
          <button
            className="rounded-md p-1 hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <p className="text-[var(--color-muted-foreground)] text-sm">
            Single venue · one court. Times follow your device timezone.
          </p>

          <div>
            <p className="font-medium text-sm">When</p>
            <p className="mt-1 text-foreground">
              {formatTimeShort(start)} – {formatTimeShort(end)}
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">Credits for this booking</span>
              <span className="font-semibold tabular-nums">{credits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">Credits after booking</span>
              <span className="font-semibold tabular-nums">
                {user ? remaining : "—"}
              </span>
            </div>
          </div>

          {!user ? (
            <p className="text-[var(--color-muted-foreground)] text-sm">
              Sign in with Google to confirm. Availability is visible to everyone; credits are only
              shown when you are signed in.
            </p>
          ) : remaining !== null && remaining < 0 ? (
            <p className="text-red-600 text-sm">Not enough credits for this selection.</p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-4">
            {!user ? (
              <button
                className="w-full rounded-lg bg-[var(--color-accent-orange)] py-3 font-semibold text-white shadow-sm transition hover:opacity-95"
                onClick={() => signInWithGoogle()}
                type="button"
              >
                Sign in with Google
              </button>
            ) : (
              <button
                className="w-full rounded-lg bg-[var(--color-accent-orange)] py-3 font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={remaining !== null && remaining < 0}
                onClick={() =>
                  onConfirm({
                    startIso: start.toISOString(),
                    endIso: end.toISOString(),
                    credits,
                  })
                }
                type="button"
              >
                Complete booking
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
