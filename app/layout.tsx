import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { getViewer } from "@/lib/auth";
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

const NAV = [
  ["/niches", "Niches"],
  ["/fastest-growing", "Fastest growing"],
  ["/outliers", "Outliers"],
  ["/tools", "Tools"],
  ["/blog", "Blog"],
  ["/ask", "Ask"],
  ["/pricing", "Pricing"],
] as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
          <Link href="/" className="font-semibold">Niches Library</Link>
          <nav aria-label="Main" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            {NAV.map(([href, label]) => <Link key={href} href={href} className="hover:text-neutral-900 dark:hover:text-white">{label}</Link>)}
            {viewer.isStaff && <Link href="/admin" className="hover:text-neutral-900 dark:hover:text-white">Admin</Link>}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {viewer.user ? (
              <>
                <Link href="/saved" className="hover:underline">Saved</Link>
                <Link href="/account" className="rounded-md border px-3 py-1.5">{viewer.plan === "pro" ? "Pro" : "Account"}</Link>
              </>
            ) : (
              <Link href="/login" className="rounded-md border px-3 py-1.5">Log in</Link>
            )}
          </div>
        </header>
        {children}
        <footer className="mx-auto mt-16 max-w-6xl border-t px-4 py-8 text-xs text-neutral-500">
          Channel stats from YouTube via the YouTube Data API. Personas, niches, offers and analysis are our own research.
        </footer>
      </body>
    </html>
  );
}
