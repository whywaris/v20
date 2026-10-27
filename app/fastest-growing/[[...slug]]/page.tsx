import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { compact } from "@/lib/format";
import { JsonLd } from "@/components/channel-card";
import { MIN_INDEXABLE, SITE } from "@/lib/seo";

// /fastest-growing (all niches) and /fastest-growing/[niche].
type Props = { params: Promise<{ slug?: string[] }> };

const getData = cache(async (slug?: string) => {
  const supabase = await createClient();
  let niche: { id: number; slug: string; name: string } | null = null;
  if (slug) {
    const { data } = await supabase.from("niches").select("id, slug, name").eq("slug", slug).maybeSingle();
    if (!data) return null;
    niche = data;
  }
  let q = supabase
    .from("channels")
    .select(`handle, title, avatar_url, tagline, subscribers, subs_gain_30d, views_gain_30d, growth_days${niche ? ", channel_niches!inner(niche_id)" : ""}`)
    .eq("status", "active").gt("subs_gain_30d", 0)
    .order("subs_gain_30d", { ascending: false }).limit(50);
  if (niche) q = q.eq("channel_niches.niche_id", niche.id);
  const { data } = await q;
  return { niche, channels: (data ?? []) as unknown as Row[] };
});

type Row = { handle: string; title: string; avatar_url: string | null; tagline: string | null; subscribers: number; subs_gain_30d: number; views_gain_30d: number | null; growth_days: number };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.[0];
  const data = await getData(slug);
  if (!data) return {};
  const name = data.niche ? `${data.niche.name} ` : "";
  return {
    title: `Fastest Growing ${name}YouTube Channels This Month`,
    description: `The ${name}YouTube channels gaining the most subscribers in the last 30 days, updated daily from YouTube stats.`,
    alternates: { canonical: `/fastest-growing${slug ? `/${slug}` : ""}` },
    robots: { index: data.channels.length >= MIN_INDEXABLE },
  };
}

export default async function FastestGrowingPage({ params }: Props) {
  const { slug } = await params;
  if (slug && slug.length > 1) notFound();
  const data = await getData(slug?.[0]);
  if (!data) notFound();
  const { niche, channels } = data;
  const name = niche ? `${niche.name} ` : "";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList", name: `Fastest growing ${name}YouTube channels`,
        itemListElement: channels.slice(0, 20).map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/channel/${c.handle}`, name: c.title })),
      }} />
      <nav className="text-sm text-neutral-500">
        <Link href="/fastest-growing" className="hover:underline">Fastest growing</Link>
        {niche && <> / <Link href={`/niche/${niche.slug}`} className="hover:underline">{niche.name}</Link></>}
      </nav>
      <header>
        <h1 className="text-3xl font-bold">Fastest growing {name}YouTube channels</h1>
        <p className="mt-2 text-neutral-500">Ranked by subscribers gained in the last 30 days (or since we started tracking). Updated daily.</p>
      </header>

      {channels.length ? (
        <ol className="divide-y rounded-lg border">
          {channels.map((c, i) => {
            const pct = c.subscribers - c.subs_gain_30d > 0 ? (c.subs_gain_30d / (c.subscribers - c.subs_gain_30d)) * 100 : null;
            return (
              <li key={c.handle}>
                <Link href={`/channel/${c.handle}`} className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <span className="w-6 text-right text-neutral-500">{i + 1}</span>
                  {c.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar_url} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-full" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.title}</p>
                    {c.tagline && <p className="truncate text-sm text-neutral-500">{c.tagline}</p>}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-green-700 dark:text-green-400">+{compact(c.subs_gain_30d)}</p>
                    <p className="text-neutral-500">{pct != null && `${pct.toFixed(1)}% · `}{c.growth_days}d · {compact(c.subscribers)} subs</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-neutral-500">Not enough history yet. Growth appears after two days of daily snapshots.</p>
      )}
    </main>
  );
}
