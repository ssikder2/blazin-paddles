"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchBookings } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import type { CourtBooking } from "@/types/booking";

interface BookingsContextValue {
  addBooking: (booking: CourtBooking) => void;
  bookings: CourtBooking[];
  refreshBookings: () => Promise<void>;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [bookings, setBookings] = useState<CourtBooking[]>([]);

  const loadBookings = useCallback(async () => {
    const supabase = createClient();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 90); // load 90 days ahead

    const data = await fetchBookings(
      supabase,
      weekStart.toISOString(),
      weekEnd.toISOString()
    );
    setBookings(data);
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addBooking = useCallback((booking: CourtBooking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  const value = useMemo(
    () => ({ bookings, addBooking, refreshBookings: loadBookings }),
    [bookings, addBooking, loadBookings]
  );

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error("useBookings must be used within BookingsProvider");
  }
  return ctx;
}
