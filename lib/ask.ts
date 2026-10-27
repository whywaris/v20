import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { aiJson } from "@/lib/ai";
import { cleanFilters, type AskFilters } from "@/lib/ask-filters";

export type AskAnswer = {
  paragraphs: string[];
  channels: { handle: string; title: string; why: string }[];
  next_steps: string[];
  filters: AskFilters;
};

const nb = (t: string) => ({ type: [t, "null"] });

function filterSchema(slugs: string[]) {
  return {
    type: "object", additionalProperties: false,
    required: ["niches", "faceless", "ai_avatar", "sells_product", "min_subs", "max_subs", "country", "language", "sort", "keywords"],
    properties: {
      niches: { type: "array", items: { type: "string", enum: slugs }, description: "Matching niche slugs, empty if the question is not niche-specific" },
      faceless: nb("boolean"), ai_avatar: nb("boolean"),
      sells_product: { ...nb("boolean"), description: "true if the user asks about channels that sell products/ebooks/courses" },
      min_subs: nb("integer"), max_subs: nb("integer"),
      country: { ...nb("string"), description: "ISO 3166 alpha-2 code if asked" },
      language: { ...nb("string"), description: "ISO 639-1 code if asked" },
      sort: { type: "string", enum: ["subscribers", "growth", "newest"] },
      keywords: { type: "array", items: { type: "string" }, description: "0-3 topic words to match in channel titles/taglines, only if no niche fits" },
    },
  };
}

const ANSWER_SCHEMA = {
  type: "object", additionalProperties: false, required: ["paragraphs", "channels", "next_steps"],
  properties: {
    paragraphs: { type: "array", items: { type: "string" }, description: "1-3 short paragraphs answering the question" },
    channels: {
      type: "array", description: "Up to 8 channels from the data that best answer the question",
      items: { type: "object", additionalProperties: false, required: ["handle", "why"], properties: { handle: { type: "string" }, why: { type: "string" } } },
    },
    next_steps: { type: "array", items: { type: "string" }, description: "2-4 concrete next steps for a creator" },
  },
};

// Question -> filters -> channels from our DB -> grounded answer. `db` is the user's client (RLS applies).
export async function askLibrary(db: SupabaseClient, question: string): Promise<AskAnswer> {
  const { data: niches } = await db.from("niches").select("slug, name");
  const slugs = niches?.map((n) => n.slug) ?? [];
  const raw = await aiJson<AskFilters>(
    `Turn a question about YouTube channels into search filters. Niches: ${niches?.map((n) => `${n.slug} (${n.name})`).join(", ")}.`,
    question, "filters", filterSchema(slugs),
  );
  const filters = cleanFilters(raw, slugs);

  const run = async (f: AskFilters) => {
    const { data: nicheRows } = f.niches.length ? await db.from("niches").select("id").in("slug", f.niches) : { data: null };
    let q = db.from("channels")
      .select(`handle, title, tagline, subscribers, subs_gain_30d, country, language, is_faceless, is_ai_avatar, created_at_yt,
        channel_niches${nicheRows ? "!inner" : ""}(niche_id, niches(slug)),
        offers${f.sells_product ? "!inner" : ""}(name, price, platform),
        channel_analysis(niche_summary, persona, format, why_it_works)`)
      .eq("status", "active")
      .order(f.sort === "growth" ? "subs_gain_30d" : f.sort === "newest" ? "created_at_yt" : "subscribers", { ascending: false, nullsFirst: false })
      .limit(25);
    if (nicheRows) q = q.in("channel_niches.niche_id", nicheRows.map((n) => n.id));
    if (f.faceless != null) q = q.eq("is_faceless", f.faceless);
    if (f.ai_avatar != null) q = q.eq("is_ai_avatar", f.ai_avatar);
    if (f.min_subs != null) q = q.gte("subscribers", f.min_subs);
    if (f.max_subs != null) q = q.lte("subscribers", f.max_subs);
    if (f.country) q = q.eq("country", f.country);
    if (f.language) q = q.ilike("language", `${f.language}%`);
    if (f.keywords.length) q = q.or(f.keywords.flatMap((k) => [`title.ilike.%${k}%`, `tagline.ilike.%${k}%`]).join(","));
    const { data, error } = await q;
    if (error) throw error;
    return data;
  };

  // Too narrow? Loosen step by step and tell the model what was dropped.
  const loosen: [string, Partial<AskFilters>][] = [
    ["keywords, size, country and language", { keywords: [], min_subs: null, max_subs: null, country: null, language: null }],
    ["faceless/AI-avatar", { faceless: null, ai_avatar: null }],
    ["niche", { niches: [] }],
  ];
  let rows = await run(filters);
  let current = filters;
  const relaxed: string[] = [];
  for (const [label, change] of loosen) {
    if (rows.length) break;
    current = { ...current, ...change };
    relaxed.push(label);
    rows = await run(current);
  }

  const answer = await aiJson<Omit<AskAnswer, "filters" | "channels"> & { channels: { handle: string; why: string }[] }>(
    `You answer questions about YouTube niches using ONLY the channel data given (from a research library).
Cite channels by handle. Use their real numbers. If the data can't answer the question, say so plainly and suggest what to search instead.
If some filters were relaxed, say in one sentence that no exact match exists and that these are the closest channels.
If the channel list is empty, say the library has no matching channels yet. Never ask the user to provide data.
No hype, plain English.`,
    JSON.stringify({ question, relaxed_filters: relaxed, channels: rows }),
    "answer", ANSWER_SCHEMA,
  );

  // Never show a channel the model made up.
  const byHandle = new Map(rows.map((r) => [r.handle, r]));
  return {
    ...answer,
    channels: answer.channels.filter((c) => byHandle.has(c.handle)).map((c) => ({ ...c, title: byHandle.get(c.handle)!.title })),
    filters,
  };
}
