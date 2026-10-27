import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { compact, duration, timeAgo } from "@/lib/format";
import { CHANNEL_CARD_COLUMNS, ChannelCard, JsonLd, type ChannelCardData } from "@/components/channel-card";
import { SITE } from "@/lib/seo";

type Params = { params: Promise<{ handle: string }> };

const getChannel = cache(async (handle: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("channels").select("*").eq("handle", handle.toLowerCase()).maybeSingle();
  return data;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getChannel((await params).handle);
  if (!c) return {};
  const title = `${c.title} YouTube Stats, Niche & Growth`;
  const description = `${c.title} (@${c.handle}) has ${compact(c.subscribers)} subscribers and ${compact(c.total_views)} views. Daily growth, latest videos, niche and what the channel sells.`;
  return {
    title,
    description,
    alternates: { canonical: `/channel/${c.handle}` },
    openGraph: { title, description, images: c.avatar_url ? [c.avatar_url] : [] },
  };
}

export default async function ChannelPage({ params }: Params) {
  const c = await getChannel((await params).handle);
  if (!c) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // RLS returns nothing for stats/analysis/offers when logged out; the queries are the same either way.
  const [{ data: nicheRows }, { data: videos }, { data: stats }, { data: analysis }, { data: offers }] = await Promise.all([
    supabase.from("channel_niches").select("is_primary, niches(id, slug, name)").eq("channel_id", c.id),
    supabase.from("videos").select("yt_video_id, title, published_at, duration_seconds, views, thumbnail_url")
      .eq("channel_id", c.id).order("published_at", { ascending: false }).limit(user ? 10 : 3),
    supabase.from("channel_stats_daily").select("date, subscribers, total_views").eq("channel_id", c.id).order("date").limit(365),
    supabase.from("channel_analysis").select("*").eq("channel_id", c.id).maybeSingle(),
    supabase.from("offers").select("*").eq("channel_id", c.id),
  ]);

  const niches = (nicheRows ?? []).map((r) => r.niches as unknown as { id: number; slug: string; name: string });
  const primary = niches[0];
  const { data: similar } = primary
    ? await supabase.from("channels").select(`${CHANNEL_CARD_COLUMNS}, channel_niches!inner(niche_id)`)
        .eq("channel_niches.niche_id", primary.id).eq("status", "active").neq("id", c.id)
        .order("subscribers", { ascending: false }).limit(6)
    : { data: [] };

  const ageYears = c.created_at_yt ? Math.floor((Date.now() - new Date(c.created_at_yt).getTime()) / 31_557_600_000) : null;
  const first30 = stats?.find((s) => new Date(s.date).getTime() >= Date.now() - 30 * 86_400_000);
  const last = stats?.at(-1);
  const subs30 = first30 && last && first30 !== last ? (last.subscribers ?? 0) - (first30.subscribers ?? 0) : null;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Channels", item: SITE },
            ...(primary ? [{ "@type": "ListItem", position: 2, name: primary.name, item: `${SITE}/niche/${primary.slug}` }] : []),
            { "@type": "ListItem", position: primary ? 3 : 2, name: c.title, item: `${SITE}/channel/${c.handle}` },
          ] },
          { "@type": "ProfilePage", mainEntity: {
            "@type": "Organization", name: c.title, url: `https://www.youtube.com/channel/${c.yt_channel_id}`, image: c.avatar_url,
            interactionStatistic: [
              { "@type": "InteractionCounter", interactionType: "https://schema.org/FollowAction", userInteractionCount: c.subscribers },
              { "@type": "InteractionCounter", interactionType: "https://schema.org/WatchAction", userInteractionCount: c.total_views },
            ],
          } },
        ],
      }} />

      <nav className="text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Channels</Link>
        {primary && <> / <Link href={`/niche/${primary.slug}`} className="hover:underline">{primary.name}</Link></>}
      </nav>

      <header className="flex flex-wrap items-center gap-4">
        {c.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatar_url} alt={`${c.title} channel logo`} width={80} height={80} className="size-20 rounded-full" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{c.title}</h1>
          <p className="text-neutral-500">
            <a href={`https://www.youtube.com/channel/${c.yt_channel_id}`} target="_blank" rel="noopener" className="hover:underline">@{c.handle}</a>
            {c.country && ` · ${c.country}`}{c.language && ` · ${c.language}`}{ageYears != null && ` · ${ageYears} years old`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {niches.map((n) => (
              <Link key={n.slug} href={`/niche/${n.slug}`} className="rounded-full border px-3 py-0.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">{n.name}</Link>
            ))}
          </div>
        </div>
      </header>

      <section>
        <dl className="grid grid-cols-3 gap-4 rounded-lg border p-5">
          <div><dt className="text-sm text-neutral-500">Subscribers</dt><dd className="text-2xl font-semibold">{compact(c.subscribers)}</dd></div>
          <div><dt className="text-sm text-neutral-500">Total views</dt><dd className="text-2xl font-semibold">{compact(c.total_views)}</dd></div>
          <div><dt className="text-sm text-neutral-500">Videos</dt><dd className="text-2xl font-semibold">{compact(c.video_count)}</dd></div>
        </dl>
        <p className="mt-2 text-xs text-neutral-500">
          Stats from YouTube{c.last_synced_at && ` · updated ${new Date(c.last_synced_at).toISOString().slice(0, 10)}`}
        </p>
      </section>

      {c.summary && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">About {c.title}</h2>
          <p className="whitespace-pre-line text-neutral-600 dark:text-neutral-400">{c.summary}</p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">Latest videos</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos?.map((v) => (
            <li key={v.yt_video_id}>
              <a href={`https://www.youtube.com/watch?v=${v.yt_video_id}`} target="_blank" rel="noopener" className="block">
                {v.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail_url} alt={v.title} loading="lazy" width={320} height={180} className="aspect-video w-full rounded-md object-cover" />
                )}
                <p className="mt-2 line-clamp-2 text-sm font-medium">{v.title}</p>
                <p className="text-xs text-neutral-500">{compact(v.views)} views · {timeAgo(v.published_at)} · {duration(v.duration_seconds)}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {user ? (
        <>
          <section>
            <h2 className="mb-3 text-xl font-semibold">Growth</h2>
            {stats && stats.length > 1 ? (
              <>
                <Sparkline values={stats.map((s) => s.subscribers ?? 0)} />
                <p className="mt-2 text-sm text-neutral-500">
                  {stats.length} daily snapshots since {stats[0].date}
                  {subs30 != null && ` · ${subs30 >= 0 ? "+" : ""}${compact(subs30)} subscribers in the last 30 days`}
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-500">We store one snapshot a day. The chart appears after the second day.</p>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">What they sell</h2>
            {offers?.length ? (
              <ul className="space-y-2">{offers.map((o) => (
                <li key={o.id} className="rounded-md border p-3 text-sm">
                  <span className="font-medium">{o.name ?? o.type}</span>{o.price != null && ` · $${o.price}`}{o.platform && ` · ${o.platform}`}
                </li>
              ))}</ul>
            ) : <p className="text-sm text-neutral-500">No product found yet.</p>}
          </section>
          {analysis && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Analysis</h2>
              <dl className="space-y-3 text-sm">
                {analysis.persona && <div><dt className="font-medium">Persona</dt><dd>{analysis.persona}</dd></div>}
                {analysis.audience && <div><dt className="font-medium">Audience</dt><dd>{analysis.audience}</dd></div>}
                {analysis.why_it_works?.length > 0 && <div><dt className="font-medium">Why it works</dt><dd><ul className="list-disc pl-5">{analysis.why_it_works.map((w: string) => <li key={w}>{w}</li>)}</ul></dd></div>}
              </dl>
            </section>
          )}
        </>
      ) : (
        <section className="rounded-lg border border-dashed p-6 text-center">
          <h2 className="text-xl font-semibold">Growth, offers and analysis</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            See {c.title}&apos;s daily subscriber growth, what the channel sells, and our analysis of why it works. Free with Google.
          </p>
          <Link href={`/login?next=/channel/${c.handle}`} className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
            Log in to see full stats
          </Link>
        </section>
      )}

      {similar && similar.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Similar {primary?.name} channels</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(similar as ChannelCardData[]).map((s) => <ChannelCard key={s.handle} c={s} />)}
          </div>
        </section>
      )}
    </main>
  );
}

// Plain SVG line; swap for a chart library when we need hover/axes.
function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${40 - ((v - min) / span) * 36 - 2}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-32 w-full rounded-md border" role="img" aria-label={`Subscribers from ${compact(min)} to ${compact(max)}`}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
