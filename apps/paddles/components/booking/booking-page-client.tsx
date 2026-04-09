"use client";

import { startOfWeek } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { BookingPanel } from "@/components/booking/booking-panel";
import { TimeGrid } from "@/components/booking/time-grid";
import { WeekStrip } from "@/components/booking/week-strip";
import { consumeCredits } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { useUserTimeZone } from "@/lib/timezone";
import { useAuth } from "@/providers/auth-provider";
import { useBookings } from "@/providers/bookings-provider";

export function BookingPageClient() {
  const tz = useUserTimeZone();
  const { user, patchCredits } = useAuth();
  const { bookings, addBooking } = useBookings();

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const weekStart = useMemo(
    () => startOfWeek(weekAnchor, { weekStartsOn: 0 }),
    [weekAnchor]
  );
  const [panelSelection, setPanelSelection] = useState<{
    dayIndex: number;
    startSlot: number;
    endSlot: number;
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const previewSelection = panelSelection;

  const handleCommitRange = useCallback(
    (payload: { dayIndex: number; startSlot: number; endSlot: number }) => {
      setPanelSelection(payload);
    },
    []
  );

  const closePanel = useCallback(() => {
    setPanelSelection(null);
    setConfirmError(null);
  }, []);

  const handleWeekChange = useCallback((next: Date) => {
    setWeekAnchor(next);
  }, []);

  const handleConfirm = useCallback(
    async (payload: { startIso: string; endIso: string; credits: number }) => {
      if (!user) {
        return;
      }
      setConfirmError(null);
      const supabase = createClient();
      const result = await consumeCredits(supabase, payload.credits);
      if (!result.ok) {
        setConfirmError(
          result.code === "insufficient"
            ? "Not enough credits for this booking."
            : result.message
        );
        return;
      }
      addBooking({
        start: payload.startIso,
        end: payload.endIso,
        bookedByUserId: user.id,
      });
      patchCredits(result.balance);
      setPanelSelection(null);
    },
    [addBooking, patchCredits, user]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-center font-semibold text-2xl tracking-tight">
        Court availability
      </h1>
      <p className="mb-6 text-center text-[var(--color-muted-foreground)] text-sm">
        Drag across a column to choose a length. Click any open slot to start.
        Times shown in <span className="font-medium text-foreground">{tz}</span>
        .
      </p>

      <div className="mb-8">
        <WeekStrip onWeekChange={handleWeekChange} weekStart={weekStart} />
      </div>

      <TimeGrid
        bookings={bookings}
        currentUserId={user?.id ?? null}
        onCommitRange={handleCommitRange}
        onInvalidRange={() => setPanelSelection(null)}
        previewSelection={previewSelection}
        weekStart={weekStart}
      />

      <p className="mt-4 text-center text-[var(--color-muted-foreground)] text-sm">
        Click and drag on an open slot to open the booking panel. Booked slots
        cannot be selected.
      </p>

      <BookingPanel
        confirmError={confirmError}
        onClose={closePanel}
        onConfirm={handleConfirm}
        selection={panelSelection ? { weekStart, ...panelSelection } : null}
      />
    </div>
  );
}
