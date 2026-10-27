import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { compact } from "@/lib/format";
import { CHANNEL_CARD_COLUMNS, ChannelCard, JsonLd, type ChannelCardData } from "@/components/channel-card";
import { MIN_INDEXABLE, SITE } from "@/lib/seo";
import { getViewer } from "@/lib/auth";
import { AdSlot } from "@/components/ad-slot";

type Params = { params: Promise<{ slug: string }> };

const getNiche = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: niche } = await supabase.from("niches").select("*").eq("slug", slug).maybeSingle();
  if (!niche) return null;
  const [{ data: channels }, { data: children }, { data: parent }] = await Promise.all([
    supabase.from("channels").select(`${CHANNEL_CARD_COLUMNS}, channel_niches!inner(niche_id)`)
      .eq("channel_niches.niche_id", niche.id).eq("status", "active")
      .order("subscribers", { ascending: false, nullsFirst: false }).limit(100),
    supabase.from("niches").select("slug, name").eq("parent_id", niche.id).order("name"),
    niche.parent_id ? supabase.from("niches").select("slug, name").eq("id", niche.parent_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return { niche, channels: (channels ?? []) as ChannelCardData[], children: children ?? [], parent };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await getNiche((await params).slug);
  if (!data) return {};
  const { niche, channels } = data;
  const title = `Best ${niche.name} YouTube Channels (${new Date().getFullYear()})`;
  return {
    title,
    description: `${channels.length} ${niche.name} YouTube channels ranked by subscribers, with daily stats, growth and what they sell.`,
    alternates: { canonical: `/niche/${niche.slug}` },
    robots: { index: niche.is_indexable || channels.length >= MIN_INDEXABLE },
  };
}

export default async function NichePage({ params }: Params) {
  const data = await getNiche((await params).slug);
  if (!data) notFound();
  const { niche, channels, children, parent } = data;
  const viewer = await getViewer();

  const subs = channels.map((c) => c.subscribers ?? 0).sort((a, b) => a - b);
  const median = subs.length ? subs[Math.floor(subs.length / 2)] : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Niches", item: `${SITE}/niches` },
            { "@type": "ListItem", position: 2, name: niche.name, item: `${SITE}/niche/${niche.slug}` },
          ] },
          { "@type": "ItemList", name: `${niche.name} YouTube channels`, numberOfItems: channels.length,
            itemListElement: channels.slice(0, 20).map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/channel/${c.handle}`, name: c.title })) },
        ],
      }} />

      <nav className="text-sm text-neutral-500">
        <Link href="/niches" className="hover:underline">Niches</Link>
        {parent && <> / <Link href={`/niche/${parent.slug}`} className="hover:underline">{parent.name}</Link></>}
      </nav>

      <header>
        <h1 className="text-3xl font-bold">{niche.name} YouTube Channels</h1>
        {(niche.seo_intro ?? niche.description) && <p className="mt-3 max-w-3xl text-neutral-600 dark:text-neutral-400">{niche.seo_intro ?? niche.description}</p>}
      </header>

      <dl className="grid grid-cols-2 gap-4 rounded-lg border p-5 sm:grid-cols-3">
        <div><dt className="text-sm text-neutral-500">Channels tracked</dt><dd className="text-2xl font-semibold">{channels.length}</dd></div>
        <div><dt className="text-sm text-neutral-500">Median subscribers</dt><dd className="text-2xl font-semibold">{compact(median)}</dd></div>
        <div><dt className="text-sm text-neutral-500">Biggest channel</dt><dd className="truncate text-2xl font-semibold">{channels[0]?.title ?? "–"}</dd></div>
      </dl>

      <p className="text-sm">
        <Link href={`/fastest-growing/${niche.slug}`} className="underline">Fastest growing {niche.name} channels this month</Link>
        {niche.rpm_low != null && <>{" · "}<Link href={`/youtube-rpm/${niche.slug}`} className="underline">{niche.name} RPM: ${niche.rpm_low}–${niche.rpm_high}</Link></>}
        {" · "}<Link href={`/outliers?niche=${niche.slug}`} className="underline">Outlier videos</Link>
        {viewer.user && <>{" · "}<a href={`/api/export?niche=${niche.slug}`} className="underline">Export CSV{viewer.isPro ? "" : " (Pro)"}</a></>}
      </p>

      {children.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Sub-niches</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((n) => <Link key={n.slug} href={`/niche/${n.slug}`} className="rounded-full border px-3 py-1 text-sm">{n.name}</Link>)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">Top {niche.name} channels by subscribers</h2>
        {channels.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{channels.map((c) => <ChannelCard key={c.handle} c={c} />)}</div>
        ) : <p className="text-neutral-500">No channels in this niche yet.</p>}
      </section>
      <AdSlot hidden={viewer.isPro} />
    </main>
  );
}
