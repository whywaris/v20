import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { compact, duration, timeAgo } from "@/lib/format";
import { CHANNEL_CARD_COLUMNS, ChannelCard, JsonLd, type ChannelCardData } from "@/components/channel-card";
import { GrowthChart } from "@/components/growth-chart";
import { SITE } from "@/lib/seo";
import type { FoundLink } from "@/lib/links";
import { getViewer } from "@/lib/auth";
import { AdSlot } from "@/components/ad-slot";
import { AffiliateBox } from "@/components/affiliate-box";
import { SaveButton } from "./save-button";

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<{ range?: string; metric?: string }> };
const RANGES = { "30d": 30, "90d": 90, all: 3650 } as const;

const getChannel = cache(async (handle: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("channels").select("*").eq("handle", handle.toLowerCase()).maybeSingle();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getChannel((await params).handle);
  if (!c) return {};
  const title = `${c.title} YouTube Stats, Niche & Growth`;
  const description = `${c.title} (@${c.handle})${c.tagline ? `: ${c.tagline}.` : ""} ${compact(c.subscribers)} subscribers, ${compact(c.total_views)} views. Daily growth, latest videos and what the channel sells.`;
  return {
    title,
    description,
    alternates: { canonical: `/channel/${c.handle}` },
    openGraph: { title, description, images: c.avatar_url ? [c.avatar_url] : [] },
  };
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section><h2 className="mb-3 text-xl font-semibold">{title}</h2>{children}</section>
);

export default async function ChannelPage({ params, searchParams }: Props) {
  const c = await getChannel((await params).handle);
  if (!c) notFound();
  const { range = "90d", metric = "subscribers" } = await searchParams;
  const days = RANGES[range as keyof typeof RANGES] ?? 90;
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const supabase = await createClient();
  const viewer = await getViewer();
  const user = viewer.user;
  const { data: savedRow } = user
    ? await supabase.from("saved_channels").select("channel_id").eq("channel_id", c.id).maybeSingle()
    : { data: null };

  // RLS returns nothing for stats/analysis/offers/funnels when logged out; the queries are the same either way.
  const [{ data: nicheRows }, { data: videos }, { data: stats }, { data: analysis }, { data: offers }, { data: funnel }] = await Promise.all([
    supabase.from("channel_niches").select("is_primary, niches(id, slug, name)").eq("channel_id", c.id),
    supabase.from("videos").select("yt_video_id, title, published_at, duration_seconds, views, thumbnail_url")
      .eq("channel_id", c.id).order("published_at", { ascending: false }).limit(user ? 10 : 3),
    supabase.from("channel_stats_daily").select("date, subscribers, total_views").eq("channel_id", c.id).gte("date", since).order("date"),
    supabase.from("channel_analysis").select("*").eq("channel_id", c.id).maybeSingle(),
    supabase.from("offers").select("*").eq("channel_id", c.id),
    supabase.from("funnels").select("*").eq("channel_id", c.id).maybeSingle(),
  ]);

  const niches = (nicheRows ?? []).map((r) => r.niches as unknown as { id: number; slug: string; name: string });
  const primary = niches[0];
  const { data: similar } = primary
    ? await supabase.from("channels").select(`${CHANNEL_CARD_COLUMNS}, channel_niches!inner(niche_id)`)
        .eq("channel_niches.niche_id", primary.id).eq("status", "active").neq("id", c.id)
        .order("subscribers", { ascending: false }).limit(6)
    : { data: [] };

  const ageYears = c.created_at_yt ? Math.floor((Date.now() - new Date(c.created_at_yt).getTime()) / 31_557_600_000) : null;
  const metricKey = metric === "views" ? "total_views" : "subscribers";
  const points = (stats ?? []).map((s) => ({ date: s.date as string, value: Number(s[metricKey] ?? 0) }));
  const links = (funnel?.links ?? []) as FoundLink[];
  const steps = (funnel?.steps ?? []) as { step: string; detail?: string | null }[];
  const tab = (key: string, value: string, label: string, active: boolean) => (
    <Link key={value} href={`?${new URLSearchParams({ range, metric, [key]: value })}`} scroll={false}
      className={`rounded-md border px-2.5 py-1 text-sm ${active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : ""}`}>{label}</Link>
  );

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
            description: c.tagline ?? undefined,
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
          {c.tagline && <p className="text-lg text-neutral-600 dark:text-neutral-400">{c.tagline}</p>}
          <p className="text-neutral-500">
            <a href={`https://www.youtube.com/channel/${c.yt_channel_id}`} target="_blank" rel="noopener" className="hover:underline">@{c.handle}</a>
            {c.country && ` · ${c.country}`}{c.language && ` · ${c.language}`}{ageYears != null && ` · ${ageYears} years old`}
            {c.is_ai_avatar && " · AI avatar"}{!c.is_ai_avatar && c.is_faceless && " · Faceless"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {niches.map((n) => (
              <Link key={n.slug} href={`/niche/${n.slug}`} className="rounded-full border px-3 py-0.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900">{n.name}</Link>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {viewer.isStaff && <Link href={`/admin/channel/${c.handle}`} className="text-sm underline">Edit</Link>}
          {user && <SaveButton channelId={c.id} initiallySaved={!!savedRow} />}
        </div>
      </header>

      <section>
        <dl className="grid grid-cols-2 gap-4 rounded-lg border p-5 sm:grid-cols-4">
          <div><dt className="text-sm text-neutral-500">Subscribers</dt><dd className="text-2xl font-semibold">{compact(c.subscribers)}</dd></div>
          <div><dt className="text-sm text-neutral-500">Total views</dt><dd className="text-2xl font-semibold">{compact(c.total_views)}</dd></div>
          <div><dt className="text-sm text-neutral-500">Videos</dt><dd className="text-2xl font-semibold">{compact(c.video_count)}</dd></div>
          <div>
            <dt className="text-sm text-neutral-500">Subs gained{c.growth_days ? ` (${c.growth_days}d)` : ""}</dt>
            <dd className="text-2xl font-semibold">{c.subs_gain_30d != null ? `${c.subs_gain_30d >= 0 ? "+" : ""}${compact(c.subs_gain_30d)}` : "–"}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-neutral-500">
          Stats from YouTube{c.last_synced_at && ` · updated ${new Date(c.last_synced_at).toISOString().slice(0, 10)}`}
        </p>
      </section>

      {c.summary && (
        <Section title={`About ${c.title}`}>
          <p className="whitespace-pre-line text-neutral-600 dark:text-neutral-400">{c.summary}</p>
        </Section>
      )}

      <Section title="Latest videos">
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
      </Section>

      {user ? (
        <>
          <Section title="Growth">
            <div className="mb-3 flex flex-wrap gap-2">
              {tab("metric", "subscribers", "Subscribers", metricKey === "subscribers")}
              {tab("metric", "views", "Total views", metricKey === "total_views")}
              <span className="w-2" />
              {Object.keys(RANGES).map((r) => tab("range", r, r === "all" ? "All" : r, range === r))}
            </div>
            {points.length > 1
              ? <GrowthChart points={points} label={metricKey === "subscribers" ? "Subscribers" : "Total views"} />
              : <p className="text-sm text-neutral-500">We store one snapshot a day. The chart appears after the second day.</p>}
          </Section>

          <Section title="What they sell">
            {offers?.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">{offers.map((o) => (
                <li key={o.id} className="rounded-md border p-4 text-sm">
                  <p className="text-xs uppercase text-neutral-500">{o.type}</p>
                  <p className="font-medium">{o.name}</p>
                  <p className="mt-1">{o.price != null && <span className="font-semibold">{o.currency === "USD" || !o.currency ? "$" : `${o.currency} `}{o.price}</span>}{o.platform && ` · ${o.platform}`}</p>
                  {o.url && <a href={o.url} target="_blank" rel="nofollow noopener" className="text-xs text-neutral-500 hover:underline">{o.evidence ?? o.url}</a>}
                </li>
              ))}</ul>
            ) : <p className="text-sm text-neutral-500">No product found yet.</p>}
          </Section>

          {steps.length > 0 && (
            <Section title="How they sell">
              <ol className="flex flex-wrap items-stretch gap-2 text-sm">
                {steps.map((s, i) => (
                  <li key={s.step} className="flex items-center gap-2">
                    <span className="rounded-md border px-3 py-2"><span className="font-medium">{i + 1}. {s.step}</span>{s.detail && <span className="block text-xs text-neutral-500">{s.detail}</span>}</span>
                    {i < steps.length - 1 && <span aria-hidden className="text-neutral-400">→</span>}
                  </li>
                ))}
              </ol>
              {funnel?.notes && <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{funnel.notes}</p>}
            </Section>
          )}

          {analysis && (
            <Section title="Analysis">
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                {analysis.niche_summary && <div><dt className="font-medium">Niche</dt><dd>{analysis.niche_summary}</dd></div>}
                {analysis.persona && <div><dt className="font-medium">Persona</dt><dd>{analysis.persona}</dd></div>}
                {analysis.audience && <div><dt className="font-medium">Audience</dt><dd>{analysis.audience}</dd></div>}
                {analysis.format && <div><dt className="font-medium">Format</dt><dd>{analysis.format}</dd></div>}
                {analysis.thumbnail_notes && <div><dt className="font-medium">Thumbnails</dt><dd>{analysis.thumbnail_notes}</dd></div>}
                <List title="Content pillars" items={analysis.pillars} />
                <List title="Title patterns" items={analysis.title_patterns} mono />
                <List title="Why it works" items={analysis.why_it_works} />
                <List title="Likely AI tools" items={analysis.ai_tools_guess} />
              </dl>
              <p className="mt-3 text-xs text-neutral-500">Our AI reading of the channel&apos;s public titles, descriptions and store page, {new Date(analysis.updated_at).toISOString().slice(0, 10)}. Not data from YouTube.</p>
            </Section>
          )}

          {links.length > 0 && (
            <Section title="Where the channel points">
              <ul className="space-y-1 text-sm">
                {/* One-off citation links (news, gov sites) are noise; keep About links and repeat ones. */}
                {links.filter((l) => l.kind !== "youtube" && (l.source === "about" || l.count >= 2 || l.kind !== "site")).slice(0, 12).map((l) => (
                  <li key={l.domain}>
                    <span className="mr-2 inline-block w-24 text-xs uppercase text-neutral-500">{l.kind.replace("_", " ")}</span>
                    <a href={l.url} target="_blank" rel="nofollow noopener" className="hover:underline">{l.platform ?? l.domain}</a>
                    <span className="text-neutral-500"> · {l.source === "about" ? "About" : `${l.count} recent descriptions`}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      ) : (
        <section className="rounded-lg border border-dashed p-6 text-center">
          <h2 className="text-xl font-semibold">Growth, offers and analysis</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            See {c.title}&apos;s daily growth chart, what the channel sells, how it sells it, and our analysis of why it works. Free with Google.
          </p>
          <Link href={`/login?next=/channel/${c.handle}`} className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
            Log in to see full stats
          </Link>
        </section>
      )}

      <AffiliateBox isAiAvatar={!!c.is_ai_avatar} isFaceless={!!c.is_faceless} />
      <AdSlot hidden={viewer.isPro} />

      {similar && similar.length > 0 && (
        <Section title={`Similar ${primary?.name} channels`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(similar as ChannelCardData[]).map((s) => <ChannelCard key={s.handle} c={s} />)}
          </div>
        </Section>
      )}
    </main>
  );
}

function List({ title, items, mono }: { title: string; items: string[] | null; mono?: boolean }) {
  if (!items?.length) return null;
  return (
    <div>
      <dt className="font-medium">{title}</dt>
      <dd><ul className={`list-disc pl-5 ${mono ? "font-mono text-xs" : ""}`}>{items.map((i) => <li key={i}>{i}</li>)}</ul></dd>
    </div>
  );
}
