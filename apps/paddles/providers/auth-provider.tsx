"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "blazin-paddles-mock-auth";

export type MockUser = {
  name: string;
  email: string;
  credits: number;
};

type AuthContextValue = {
  user: MockUser | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  setCredits: (next: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): MockUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(loadStoredUser());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signInWithGoogle = useCallback(() => {
    setUser({
      name: "Demo Player",
      email: "you@example.com",
      credits: 10,
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const setCredits = useCallback((next: number) => {
    setUser((u) => (u ? { ...u, credits: Math.max(0, next) } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      signInWithGoogle,
      signOut,
      setCredits,
    }),
    [user, signInWithGoogle, signOut, setCredits]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
