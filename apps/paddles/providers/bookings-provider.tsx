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

import type { CourtBooking } from "@/types/booking";

const STORAGE_KEY = "blazin-paddles-bookings-v2";

interface BookingsContextValue {
  addBooking: (booking: Omit<CourtBooking, "id">) => CourtBooking | null;
  bookings: CourtBooking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [bookings, setBookings] = useState<CourtBooking[]>(() => []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setBookings(JSON.parse(raw) as CourtBooking[]);
      }
    } catch {
      // keep seed
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || bookings.length === 0) {
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = useCallback((b: Omit<CourtBooking, "id">) => {
    const next: CourtBooking = {
      ...b,
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `b-${Date.now()}`,
    };
    setBookings((prev) => [...prev, next]);
    return next;
  }, []);

  const value = useMemo(
    () => ({ bookings, addBooking }),
    [bookings, addBooking]
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
