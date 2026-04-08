"use client";

import { useEffect, useState } from "react";

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

export function useUserTimeZone(): string {
  const [tz, setTz] = useState("UTC");

  useEffect(() => {
    setTz(getUserTimeZone());
  }, []);

  return tz;
}

export function formatTimeShort(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export function formatDayLabel(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
}
