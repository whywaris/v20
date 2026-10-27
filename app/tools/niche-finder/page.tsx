import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compact } from "@/lib/format";
import { JsonLd } from "@/components/channel-card";
import { Faq, toolJsonLd } from "@/components/faq";
import { SITE } from "@/lib/seo";

const DESCRIPTION = "Compare YouTube niches by estimated RPM, how many channels compete, how fast they grow and how many sell their own products.";
export const metadata: Metadata = { title: "YouTube Niche Finder", description: DESCRIPTION, alternates: { canonical: "/tools/niche-finder" } };

const SORTS = {
  rpm: { col: "rpm_high", label: "RPM" },
  growth: { col: "avg_subs_gain", label: "Avg. growth" },
  selling: { col: "pct_selling", label: "% selling" },
  channels: { col: "channels", label: "Channels" },
} as const;

export default async function NicheFinderPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort = "rpm" } = await searchParams;
  const s = SORTS[sort as keyof typeof SORTS] ?? SORTS.rpm;
  const supabase = await createClient();
  const { data: niches } = await supabase.from("niche_stats").select("*").order(s.col, { ascending: false, nullsFirst: false });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <JsonLd data={toolJsonLd("YouTube Niche Finder", `${SITE}/tools/niche-finder`, DESCRIPTION)} />
      <header>
        <h1 className="text-3xl font-bold">YouTube niche finder</h1>
        <p className="mt-2 text-neutral-500">{DESCRIPTION}</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-neutral-500">
            <tr className="border-b">
              <th className="py-2">Niche</th>
              {Object.entries(SORTS).map(([k, v]) => (
                <th key={k} className="text-right">
                  <Link href={`?sort=${k}`} className={sort === k ? "font-semibold text-neutral-900 dark:text-white" : "hover:underline"} aria-current={sort === k ? "true" : undefined}>{v.label}</Link>
                </th>
              ))}
              <th className="text-right">Median subs</th>
            </tr>
          </thead>
          <tbody>
            {niches?.map((n) => (
              <tr key={n.slug} className="border-b">
                <td className="py-2"><Link href={`/niche/${n.slug}`} className="font-medium hover:underline">{n.name}</Link></td>
                <td className="text-right">{n.rpm_low != null ? <Link href={`/youtube-rpm/${n.slug}`} className="hover:underline">${n.rpm_low}–${n.rpm_high}</Link> : "–"}</td>
                <td className="text-right">{n.avg_subs_gain != null ? `+${compact(n.avg_subs_gain)}` : "–"}</td>
                <td className="text-right">{n.channels ? `${n.pct_selling ?? 0}%` : "–"}</td>
                <td className="text-right">{n.channels}</td>
                <td className="text-right">{compact(n.median_subs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">RPM is an estimate. Growth = average subscribers gained in 30 days per tracked channel. Channel counts are what we track, not all of YouTube.</p>

      <Faq items={[
        ["How do I pick a YouTube niche?", "Look for a niche with a decent RPM, channels that are still growing, and room to stand out. A high '% selling' means creators there already make money from their own products, not just ads."],
        ["What is a low-competition niche?", "One where few channels exist but the ones that do are growing. Sort by growth and look for niches with a small channel count."],
        ["Where does this data come from?", "Subscriber and view numbers come from the YouTube Data API, refreshed daily. RPM ranges and product data are our own research."],
      ]} />
    </main>
  );
}
