import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { compact } from "@/lib/format";
import { JsonLd } from "@/components/channel-card";
import { Faq } from "@/components/faq";
import { MoneyCalculator } from "@/components/money-calculator";
import { MIN_INDEXABLE, SITE } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const getData = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: n } = await supabase.from("niche_stats").select("*").eq("slug", slug).maybeSingle();
  if (!n || n.rpm_low == null) return null;
  const { data: channels } = await supabase.from("channels")
    .select("handle, title, subscribers, views_gain_30d, growth_days, channel_niches!inner(niche_id)")
    .eq("channel_niches.niche_id", n.id).eq("status", "active").not("views_gain_30d", "is", null)
    .order("views_gain_30d", { ascending: false }).limit(10);
  return { n: { ...n, rpm_low: Number(n.rpm_low), rpm_high: Number(n.rpm_high) }, channels: channels ?? [] };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getData((await params).slug);
  if (!data) return {};
  const { n } = data;
  return {
    title: `${n.name} YouTube RPM: $${n.rpm_low}–$${n.rpm_high} per 1,000 Views`,
    description: `How much ${n.name} YouTube channels earn: estimated RPM of $${n.rpm_low}–$${n.rpm_high}, an earnings calculator and real channels' monthly views.`,
    alternates: { canonical: `/youtube-rpm/${n.slug}` },
    robots: { index: n.is_indexable || n.channels >= MIN_INDEXABLE },
  };
}

export default async function RpmPage({ params }: Props) {
  const data = await getData((await params).slug);
  if (!data) notFound();
  const { n, channels } = data;
  const usd = (x: number) => `$${Math.round(x).toLocaleString("en-US")}`;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Money calculator", item: `${SITE}/tools/youtube-money-calculator` },
        { "@type": "ListItem", position: 2, name: `${n.name} RPM`, item: `${SITE}/youtube-rpm/${n.slug}` },
      ] }} />
      <nav className="text-sm text-neutral-500"><Link href="/tools/youtube-money-calculator" className="hover:underline">Money calculator</Link> / {n.name}</nav>
      <header>
        <h1 className="text-3xl font-bold">{n.name} YouTube RPM</h1>
        <p className="mt-2 text-lg">Estimated <strong>${n.rpm_low}–${n.rpm_high}</strong> per 1,000 views for long-form {n.name.toLowerCase()} videos.</p>
      </header>

      <MoneyCalculator niches={[{ slug: n.slug, name: n.name, rpm_low: n.rpm_low, rpm_high: n.rpm_high }]} />

      <section>
        <h2 className="mb-3 text-xl font-semibold">What {n.name} channels could earn</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-500"><tr><th className="py-1">Monthly views</th><th className="text-right">Estimated monthly ad revenue</th></tr></thead>
          <tbody>
            {[10_000, 100_000, 1_000_000, 10_000_000].map((v) => (
              <tr key={v} className="border-t"><td className="py-2">{compact(v)}</td><td className="text-right">{usd((v * n.rpm_low) / 1000)}–{usd((v * n.rpm_high) / 1000)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {channels.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Real {n.name} channels, last 30 days</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-neutral-500"><tr><th className="py-1">Channel</th><th className="text-right">Views gained</th><th className="text-right">Est. ad revenue</th></tr></thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.handle} className="border-t">
                  <td className="py-2"><Link href={`/channel/${c.handle}`} className="hover:underline">{c.title}</Link></td>
                  <td className="text-right">{compact(c.views_gain_30d)}{c.growth_days && c.growth_days < 30 ? ` (${c.growth_days}d)` : ""}</td>
                  <td className="text-right">{usd((c.views_gain_30d! * n.rpm_low) / 1000)}–{usd((c.views_gain_30d! * n.rpm_high) / 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-neutral-500">Views from YouTube; revenue is our estimate, not the channel&apos;s real earnings.</p>
        </section>
      )}

      <p className="text-sm">
        <Link href={`/niche/${n.slug}`} className="underline">All {n.name} channels</Link>
        {" · "}<Link href={`/fastest-growing/${n.slug}`} className="underline">Fastest growing</Link>
        {n.pct_selling != null && ` · ${n.pct_selling}% of tracked ${n.name} channels sell a product`}
      </p>

      <Faq items={[
        [`How much do ${n.name} YouTubers make per 1,000 views?`, `Typically $${n.rpm_low} to $${n.rpm_high} per 1,000 long-form views after YouTube's share, depending mostly on where viewers live.`],
        [`Is ${n.name} a good YouTube niche for money?`, `Ad revenue is only part of it. ${n.pct_selling ?? 0}% of the ${n.channels} ${n.name} channels we track also sell their own product, which often earns more than ads.`],
        ["How is RPM different from CPM?", "CPM is what advertisers pay per 1,000 ad impressions. RPM is what the creator keeps per 1,000 views, after YouTube's 45% cut and views with no ads."],
      ]} />
    </main>
  );
}
