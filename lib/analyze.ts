import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { aiJson } from "@/lib/ai";
import { fetchPublicHtml, htmlToText } from "@/lib/fetch-page";
import { classify, collectLinks, extractUrls, pickLanding } from "@/lib/links";
import { fetchChannelsById, fetchLatestVideos, parseDuration } from "@/lib/youtube";
import { mapPool } from "@/lib/pool";

type Analysis = {
  tagline: string;
  niche_summary: string;
  primary_niche: string;
  persona: string | null;
  audience: string;
  format: string;
  pillars: string[];
  title_patterns: string[];
  why_it_works: string[];
  is_faceless: boolean;
  is_ai_avatar: boolean;
  thumbnail_notes: string;
  ai_tools_guess: string[];
  offers: { type: string; name: string; price: number | null; currency: string | null; platform: string | null }[];
  funnel_notes: string | null;
};

const str = { type: "string" };
const strArr = { type: "array", items: str };
const nullable = (t: string) => ({ type: [t, "null"] });

function schema(nicheSlugs: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["tagline", "niche_summary", "primary_niche", "persona", "audience", "format", "pillars", "title_patterns",
      "why_it_works", "is_faceless", "is_ai_avatar", "thumbnail_notes", "ai_tools_guess", "offers", "funnel_notes"],
    properties: {
      tagline: { ...str, description: "Max 60 chars, what the channel is about, e.g. 'Cheap Amish-style home fixes'" },
      niche_summary: { ...str, description: "One sentence describing the niche and angle" },
      primary_niche: { type: "string", enum: [...nicheSlugs, "other"] },
      persona: { ...nullable("string"), description: "On-screen persona/host: name, role, age, look. null if none" },
      audience: str,
      format: { ...str, description: "Typical video format and length" },
      pillars: { ...strArr, description: "3-6 recurring content topics" },
      title_patterns: { ...strArr, description: "2-5 title templates with [placeholders], copied from real titles" },
      why_it_works: { ...strArr, description: "3-5 reasons backed by numbers from recent_videos: standout videos vs the typical view count, upload frequency, views per subscriber, title hooks. Do not just restate subscriber or view totals." },
      is_faceless: { type: "boolean" },
      is_ai_avatar: { type: "boolean", description: "The on-screen host in the thumbnails looks AI-generated (too-perfect skin, rendered scenes, same synthetic face across thumbnails)" },
      thumbnail_notes: { ...str, description: "1-2 sentences on the thumbnail style: who/what is shown, text, colors" },
      ai_tools_guess: { ...strArr, description: "Likely AI tools (voice, avatar, script). Empty if no signal" },
      offers: {
        type: "array",
        description: "Products a buyer can pay for separately, ONLY if the landing page text shows them. Use the actual selling price, not a crossed-out or 'value' price. Items listed as bonuses, included, free or 'worth $X' inside a bundle are NOT offers; mention them in funnel_notes instead.",
        items: {
          type: "object", additionalProperties: false,
          required: ["type", "name", "price", "currency", "platform"],
          properties: {
            type: { type: "string", enum: ["ebook", "guide", "course", "membership", "physical", "coaching", "software", "other"] },
            name: str, price: nullable("number"), currency: nullable("string"), platform: nullable("string"),
          },
        },
      },
      funnel_notes: { ...nullable("string"), description: "2-3 sentences on how the channel sends viewers to the offer. null if no offer" },
    },
  };
}

const SYSTEM = `You analyze YouTube channels for a research library.
Use only the data given. Do not invent numbers, products or prices. If something is unknown, say so briefly or use null/empty arrays.
Write plain, specific English. No hype.`;

// Fetch fresh YouTube data, detect links/landing page, ask the AI, and store everything for one channel.
export async function analyzeChannel(db: SupabaseClient, channel: { id: number; yt_channel_id: string; subscribers: number | null; total_views: number | null; video_count: number | null; created_at_yt: string | null }) {
  const [yt] = await fetchChannelsById([channel.yt_channel_id]);
  if (!yt) throw new Error("channel not found on YouTube");
  const videos = await fetchLatestVideos(yt.contentDetails.relatedPlaylists.uploads, 20);
  const descriptions = videos.map((v) => v.snippet.description ?? "");

  const links = collectLinks(yt.snippet.description, descriptions);
  const landing = pickLanding(links);
  const page = landing ? await fetchPublicHtml(landing.url) : null;
  const pageText = page ? htmlToText(page.html) : null;
  // Checkout = first known store/membership platform linked from the landing page (or the landing itself).
  const checkout = landing && landing.kind !== "site" && landing.kind !== "link_hub"
    ? landing.platform
    : page ? extractUrls(page.html).map(classify).find((c) => c && (c.kind === "store" || c.kind === "membership"))?.platform ?? null
    : null;
  const linkRate = landing && descriptions.length
    ? Math.round((descriptions.filter((d) => d.includes(landing.domain)).length / descriptions.length) * 100)
    : null;

  const { data: niches } = await db.from("niches").select("id, slug, name");
  const input = {
    channel: { title: yt.snippet.title, about: yt.snippet.description.slice(0, 2000), country: yt.snippet.country, created: yt.snippet.publishedAt,
      subscribers: channel.subscribers, total_views: channel.total_views, videos: channel.video_count },
    recent_videos: videos.map((v) => ({ title: v.snippet.title, views: Number(v.statistics.viewCount ?? 0), published: v.snippet.publishedAt.slice(0, 10), seconds: parseDuration(v.contentDetails.duration) })),
    description_sample: descriptions.slice(0, 3).map((d) => d.slice(0, 800)),
    links: links.slice(0, 15).map(({ domain, kind, platform, source, count }) => ({ domain, kind, platform, source, used_in_descriptions: count })),
    landing_page: landing ? { url: page?.url ?? landing.url, text: pageText ?? "(could not load)" } : null,
    niches: niches?.map((n) => `${n.slug}: ${n.name}`),
  };

  // The 3 most-viewed recent thumbnails let the model judge the host (real vs AI avatar) and thumbnail style.
  const thumbs = [...videos].sort((x, y) => Number(y.statistics.viewCount ?? 0) - Number(x.statistics.viewCount ?? 0))
    .slice(0, 3).map((v) => v.snippet.thumbnails.medium?.url).filter((u): u is string => !!u);
  const a = await aiJson<Analysis>(SYSTEM, JSON.stringify(input), "channel_analysis", schema(niches?.map((n) => n.slug) ?? []), thumbs);
  const now = new Date().toISOString();

  const writes = await Promise.all([
    db.from("channels").update({ tagline: a.tagline.slice(0, 80), is_faceless: a.is_faceless, is_ai_avatar: a.is_ai_avatar, format: a.format, analyzed_at: now }).eq("id", channel.id),
    db.from("channel_analysis").upsert({
      channel_id: channel.id, persona: a.persona || null, audience: a.audience, pillars: a.pillars, title_patterns: a.title_patterns,
      why_it_works: a.why_it_works, ai_tools_guess: a.ai_tools_guess, thumbnail_notes: a.thumbnail_notes, niche_summary: a.niche_summary, format: a.format, updated_at: now,
    }),
    db.from("funnels").upsert({
      channel_id: channel.id,
      links,
      link_rate: linkRate,
      notes: a.funnel_notes,
      checked_at: now,
      steps: landing ? [
        { step: "Video" },
        { step: "Description", detail: linkRate != null ? `Link in ${linkRate}% of recent descriptions` : null },
        { step: "Landing page", detail: landing.domain },
        ...(checkout ? [{ step: "Checkout", detail: checkout }] : []),
      ] : [],
    }),
  ]);
  const failed = writes.find((w) => w.error);
  if (failed) throw failed.error;

  await db.from("offers").delete().eq("channel_id", channel.id);
  if (a.offers.length) {
    const { error } = await db.from("offers").insert(a.offers.map((o) => ({
      channel_id: channel.id, type: o.type, name: o.name, price: o.price, currency: o.currency ?? "USD",
      platform: o.platform ?? checkout, url: page?.url ?? landing?.url ?? null, evidence: landing?.domain ?? null, checked_at: now,
    })));
    if (error) throw error;
  }

  // Auto-tag channels that have no niche yet; admins can change it later.
  const niche = niches?.find((n) => n.slug === a.primary_niche);
  if (niche) {
    const { count } = await db.from("channel_niches").select("*", { count: "exact", head: true }).eq("channel_id", channel.id);
    if (!count) await db.from("channel_niches").insert({ channel_id: channel.id, niche_id: niche.id, is_primary: true });
  }
  return a;
}

const ANALYZE_CONCURRENCY = 6;

// Analyze never-analyzed channels first, then the oldest, 6 at a time until `deadline`.
// Channels not started before the deadline are left for the next run.
export async function analyzeBatch(db: SupabaseClient, limit = 20, handle?: string, deadline = Infinity) {
  let q = db.from("channels").select("id, yt_channel_id, handle, subscribers, total_views, video_count, created_at_yt").eq("status", "active");
  q = handle ? q.eq("handle", handle.toLowerCase().replace(/^@/, "")) : q.order("analyzed_at", { ascending: true, nullsFirst: true }).limit(limit);
  const { data, error } = await q;
  if (error) throw error;

  const settled = await mapPool(data, ANALYZE_CONCURRENCY, (c) => analyzeChannel(db, c), deadline);
  const results = settled.flatMap((s, i) => "skipped" in s ? [] : [{ handle: data[i].handle as string, ok: s.ok, ...(!s.ok && { error: String(s.error) }) }]);

  // Failed channels go to the back of the queue instead of blocking it every run.
  const failed = data.filter((_, i) => { const s = settled[i]; return "ok" in s && !s.ok; }).map((c) => c.id);
  if (failed.length) await db.from("channels").update({ analyzed_at: new Date().toISOString() }).in("id", failed);
  for (const r of results) if (!r.ok) console.error("analyze failed", r.handle, r.error);
  return results;
}

export async function countUnanalyzed(db: SupabaseClient) {
  const { count } = await db.from("channels").select("*", { count: "exact", head: true }).eq("status", "active").is("analyzed_at", null);
  return count ?? 0;
}
