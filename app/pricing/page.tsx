import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { checkoutUrl, PRICES } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free YouTube niche research with Google login. Pro adds CSV export, the outlier finder, unlimited saved channels and more AI questions.",
  alternates: { canonical: "/pricing" },
};

const FEATURES: [string, string, string][] = [
  ["Channel stats, latest videos, niche pages", "✓", "✓"],
  ["Growth charts, offers, sales funnels, AI analysis", "✓ with Google login", "✓"],
  ["Saved channels", "Up to 10", "Unlimited"],
  ["Ask the library (AI)", "3 questions/day", "50 questions/day"],
  ["Outlier video finder", "Top 5", "Full list + filters"],
  ["CSV export", "–", "✓ up to 5,000 rows"],
  ["Ads", "Yes", "No ads"],
];

export default async function PricingPage() {
  const v = await getViewer();
  const link = (base: string | undefined) =>
    !v.user ? "/login?next=/pricing" : base ? checkoutUrl(base, v.user.id, v.user.email) : null;
  const monthly = link(process.env.LEMONSQUEEZY_CHECKOUT_MONTHLY_URL);
  const yearly = link(process.env.LEMONSQUEEZY_CHECKOUT_YEARLY_URL);
  const btn = "block rounded-md px-4 py-2.5 text-center text-sm font-medium";

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold">Simple pricing</h1>
        <p className="mt-3 text-neutral-500">Most of the library is free. Pro is for people researching niches every week.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <p className="text-sm text-neutral-500">Log in with Google</p>
          <Link href={v.user ? "/" : "/login?next=/"} className={`${btn} mt-6 border`}>{v.user ? "You're on Free" : "Start free"}</Link>
        </section>
        <section className="rounded-xl border-2 border-neutral-900 p-6 dark:border-white">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-3xl font-bold">${PRICES.monthly.amount}<span className="text-base font-normal text-neutral-500">/month</span></p>
          <p className="text-sm text-neutral-500">or ${PRICES.yearly.amount}/year (save {Math.round((1 - PRICES.yearly.amount / (PRICES.monthly.amount * 12)) * 100)}%)</p>
          {v.plan === "pro" ? (
            <Link href="/account" className={`${btn} mt-6 border`}>You&apos;re on Pro · Manage</Link>
          ) : monthly && yearly ? (
            <div className="mt-6 grid gap-2">
              <a href={monthly} className={`${btn} bg-neutral-900 text-white dark:bg-white dark:text-neutral-900`}>Get Pro monthly</a>
              <a href={yearly} className={`${btn} border`}>Get Pro yearly</a>
            </div>
          ) : (
            <p className="mt-6 text-sm text-neutral-500">Checkout is not set up yet.</p>
          )}
        </section>
      </div>

      <table className="w-full text-left text-sm">
        <thead><tr className="border-b"><th className="py-2">Feature</th><th>Free</th><th>Pro</th></tr></thead>
        <tbody>{FEATURES.map(([f, free, pro]) => <tr key={f} className="border-b"><td className="py-2 pr-4">{f}</td><td className="pr-4">{free}</td><td>{pro}</td></tr>)}</tbody>
      </table>
      <p className="text-xs text-neutral-500">Payments handled by Lemon Squeezy (merchant of record, taxes included). Cancel anytime; Pro stays on until the end of the paid period.</p>
    </main>
  );
}
