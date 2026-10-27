"use client";

import { useState } from "react";

export type RpmNiche = { slug: string; name: string; rpm_low: number; rpm_high: number };

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: n < 10 ? 2 : 0 });

// Daily views × niche RPM range. RPM = what a creator earns per 1,000 views after YouTube's cut.
export function MoneyCalculator({ niches, initialSlug }: { niches: RpmNiche[]; initialSlug?: string }) {
  const [views, setViews] = useState(10_000);
  const [slug, setSlug] = useState(initialSlug ?? niches[0]?.slug ?? "");
  const n = niches.find((x) => x.slug === slug) ?? niches[0];
  if (!n) return null;
  const rows: [string, number][] = [["Per day", 1], ["Per month", 30], ["Per year", 365]];

  return (
    <div className="space-y-4 rounded-lg border p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Daily views</span>
          <input type="number" min={0} step={1000} value={views} onChange={(e) => setViews(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-md border bg-transparent px-3 py-2" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Niche</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-md border bg-transparent px-3 py-2">
            {niches.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-neutral-500">Estimated RPM for {n.name}: {usd(n.rpm_low)}–{usd(n.rpm_high)} per 1,000 views</p>
      <table className="w-full text-left text-sm" aria-live="polite">
        <thead className="text-neutral-500"><tr><th className="py-1">Earnings</th><th className="text-right">Low</th><th className="text-right">High</th></tr></thead>
        <tbody>
          {rows.map(([label, days]) => (
            <tr key={label} className="border-t">
              <td className="py-2">{label}</td>
              <td className="text-right font-medium">{usd((views * days * n.rpm_low) / 1000)}</td>
              <td className="text-right font-medium">{usd((views * days * n.rpm_high) / 1000)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-neutral-500">Estimates for long-form ad revenue only. Shorts pay far less; country, season and audience age change RPM a lot.</p>
    </div>
  );
}
