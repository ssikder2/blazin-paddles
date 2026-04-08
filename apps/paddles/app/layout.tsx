import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/providers/auth-provider";
import { BookingsProvider } from "@/providers/bookings-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Blazin' Paddles — Court booking",
  description: "Book the court, manage sessions, and track credits.",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <BookingsProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </BookingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
