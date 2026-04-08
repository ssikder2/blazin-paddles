"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchProfileCredits } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string | undefined;
  name: string | null;
  avatarUrl: string | null;
  credits: number;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setCredits: (next: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthUser(sessionUser: User, credits: number): AuthUser {
  const meta = sessionUser.user_metadata as Record<string, unknown>;
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    sessionUser.email?.split("@")[0] ||
    null;
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name,
    avatarUrl,
    credits,
  };
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function syncUser(sessionUser: User | null) {
      if (!sessionUser) {
        setUser(null);
        return;
      }
      const credits = await fetchProfileCredits(supabase, sessionUser.id);
      if (!cancelled) {
        setUser(mapAuthUser(sessionUser, credits));
      }
    }

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      await syncUser(session?.user ?? null);
      setIsLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        await syncUser(session?.user ?? null);
        setIsLoading(false);
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/book`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    setUser(null);
    await supabase.auth.signOut();
  }, []);

  const setCredits = useCallback(async (next: number) => {
    const supabase = createClient();
    const clamped = Math.max(0, next);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return;
    }

    setUser((u) => (u ? { ...u, credits: clamped } : null));

    const { error: upsertError } = await supabase.from("profiles").upsert(
      { id: session.user.id, credits: clamped },
      { onConflict: "id" }
    );

    if (upsertError) {
      const credits = await fetchProfileCredits(supabase, session.user.id);
      setUser(mapAuthUser(session.user, credits));
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signInWithGoogle,
      signOut,
      setCredits,
    }),
    [user, isLoading, signInWithGoogle, signOut, setCredits]
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
