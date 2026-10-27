import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "YouTube Niches Library", template: "%s · YouTube Niches Library" },
  description: "YouTube channels across every niche, with daily stats, what they sell and why they work.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">Niches Library</Link>
          {user ? (
            <form action="/auth/signout" method="post" className="flex items-center gap-3 text-sm">
              <span className="text-neutral-500">{user.email}</span>
              <button className="rounded-md border px-3 py-1.5">Log out</button>
            </form>
          ) : (
            <Link href="/login" className="rounded-md border px-3 py-1.5 text-sm">Log in</Link>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
