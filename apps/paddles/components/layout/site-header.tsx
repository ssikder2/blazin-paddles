"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/auth-provider";

const nav = [
  { href: "/book", label: "Book a Court" },
  { href: "/sessions", label: "My Sessions" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="border-[var(--color-border)] border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link className="font-semibold text-lg tracking-tight" href="/book">
          Blazin&apos; Paddles
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-6 max-sm:hidden">
          {nav.map((item) => (
            <Link
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--color-accent-orange)]",
                pathname === item.href
                  ? "text-[var(--color-accent-orange)]"
                  : "text-[var(--color-muted-foreground)]"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {isLoading ? (
            <span className="text-[var(--color-muted-foreground)] text-sm">Loading…</span>
          ) : user ? (
            <>
              {user.avatarUrl ? (
                <img
                  alt=""
                  className="size-8 rounded-full border border-[var(--color-border)]"
                  height={32}
                  src={user.avatarUrl}
                  width={32}
                />
              ) : null}
              <div
                aria-live="polite"
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-1 font-medium text-sm tabular-nums"
                title="Credits remaining"
              >
                {user.credits} credits
              </div>
              <button
                className="text-[var(--color-muted-foreground)] text-sm underline-offset-4 hover:underline"
                onClick={() => void signOut()}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="rounded-full bg-[var(--color-accent-orange)] px-4 py-2 font-medium text-sm text-white shadow-sm transition hover:opacity-95"
              onClick={() => void signInWithGoogle()}
              type="button"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      <nav className="flex justify-center gap-4 border-[var(--color-border)] border-t px-4 py-2 sm:hidden">
        {nav.map((item) => (
          <Link
            className={cn(
              "text-sm font-medium",
              pathname === item.href
                ? "text-[var(--color-accent-orange)]"
                : "text-[var(--color-muted-foreground)]"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
