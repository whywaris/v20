// Which channels, outliers and related niches belong to a niche. Pure functions (no file I/O) so they can be tested.
// Channels in the data have no description field, so matching uses title, tags and categories.

export type MatchChannel = {
  handle: string;
  title: string;
  subscribers: number;
  categories?: string[];
  tags?: string[];
};
export type MatchNiche = { name: string; slug: string; channelCount?: number };
export type MatchOutlier = { channelHandle?: string; channelId?: string; category?: string; tags?: string[]; multiplier?: number };

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const STOP = new Set(['and', 'the', 'for', 'with', 'of', 'in', 'on', 'to', 'a', 'an', 'youtube', 'channel', 'channels', 'videos']);
export const keywords = (s: string) => slugify(s).split('-').filter((w) => w.length > 2 && !STOP.has(w));
const words = (s: string) => new Set(slugify(s).split('-'));

/** Exact = a category or tag that is this niche (by name or slug). */
export function isExactMatch(c: MatchChannel, n: MatchNiche): boolean {
  const name = n.name.toLowerCase().trim();
  return [...(c.categories ?? []), ...(c.tags ?? [])].some((x) => x.toLowerCase().trim() === name || slugify(x) === n.slug);
}

/** Keyword = every keyword of the niche name appears as a whole word in the title, tags or categories. */
export function isKeywordMatch(c: MatchChannel, n: MatchNiche): boolean {
  const need = keywords(n.name);
  if (!need.length) return false;
  const have = new Set<string>();
  for (const text of [c.title, ...(c.categories ?? []), ...(c.tags ?? [])]) words(text).forEach((w) => have.add(w));
  return need.every((w) => have.has(w));
}

export const MIN_EXACT = 6;

/**
 * Channels for a niche, biggest first. Keyword matches are only added when there are fewer than MIN_EXACT exact
 * matches, and are returned separately so the page can label them. Never falls back to unrelated channels.
 */
export function matchChannels<C extends MatchChannel>(niche: MatchNiche, channels: C[]) {
  const bySubs = (a: C, b: C) => (b.subscribers || 0) - (a.subscribers || 0);
  const exact = channels.filter((c) => isExactMatch(c, niche)).sort(bySubs);
  const related = exact.length >= MIN_EXACT ? [] : channels.filter((c) => !isExactMatch(c, niche) && isKeywordMatch(c, niche)).sort(bySubs);
  return { exact, related, all: [...exact, ...related] };
}

/**
 * Same result as matchChannels(niche, channels).all.length, but indexed once so it can be asked for thousands of
 * niches (sitemaps). Exact keys: category/tag lowercased name and slug; keyword index: whole words.
 */
export function nicheChannelCounter(channels: MatchChannel[]) {
  const exactIndex = new Map<string, Set<number>>();
  const wordIndex = new Map<string, Set<number>>();
  const add = (m: Map<string, Set<number>>, k: string, i: number) => (m.get(k) ?? m.set(k, new Set()).get(k)!).add(i);
  channels.forEach((c, i) => {
    for (const x of [...(c.categories ?? []), ...(c.tags ?? [])]) {
      add(exactIndex, `name:${x.toLowerCase().trim()}`, i);
      add(exactIndex, `slug:${slugify(x)}`, i);
    }
    for (const text of [c.title, ...(c.categories ?? []), ...(c.tags ?? [])]) words(text).forEach((w) => add(wordIndex, w, i));
  });
  return (n: MatchNiche): number => {
    const exact = new Set([...(exactIndex.get(`name:${n.name.toLowerCase().trim()}`) ?? []), ...(exactIndex.get(`slug:${n.slug}`) ?? [])]);
    if (exact.size >= MIN_EXACT) return exact.size;
    const need = keywords(n.name);
    if (!need.length) return exact.size;
    let hits = [...(wordIndex.get(need[0]) ?? [])];
    for (const w of need.slice(1)) {
      const s = wordIndex.get(w);
      hits = s ? hits.filter((i) => s.has(i)) : [];
    }
    return exact.size + hits.filter((i) => !exact.has(i)).length;
  };
}

const norm = (h?: string) => (h ?? '').toLowerCase().trim().replace(/^@/, '');

/** Outliers from the niche's channels (plus any tagged with the niche itself), highest multiplier first. */
export function matchOutliers<O extends MatchOutlier>(niche: MatchNiche, outliers: O[], channels: MatchChannel[]) {
  const handles = new Set(channels.map((c) => norm(c.handle)));
  return outliers
    .filter(
      (o) =>
        handles.has(norm(o.channelHandle)) ||
        handles.has(norm(o.channelId)) ||
        [o.category ?? '', ...(o.tags ?? [])].some((x) => x && (x.toLowerCase().trim() === niche.name.toLowerCase() || slugify(x) === niche.slug))
    )
    .sort((a, b) => (b.multiplier ?? 0) - (a.multiplier ?? 0));
}

/** Niches sharing a keyword with this one, most channels first. */
export function relatedNiches<N extends MatchNiche>(niche: N, niches: N[], limit = 6): N[] {
  const mine = new Set(keywords(niche.name));
  if (!mine.size) return [];
  return niches
    .filter((n) => n.slug !== niche.slug && keywords(n.name).some((w) => mine.has(w)))
    .sort((a, b) => (b.channelCount ?? 0) - (a.channelCount ?? 0))
    .slice(0, limit);
}
