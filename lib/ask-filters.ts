// Filters the AI extracts from a question, and their sanitizing. Pure, no I/O.
export type AskFilters = {
  niches: string[];
  faceless: boolean | null;
  ai_avatar: boolean | null;
  sells_product: boolean | null;
  min_subs: number | null;
  max_subs: number | null;
  country: string | null;
  language: string | null;
  sort: "subscribers" | "growth" | "newest";
  keywords: string[];
};

export function cleanFilters(f: AskFilters, validSlugs: string[]): AskFilters {
  const int = (n: number | null) => (n != null && Number.isFinite(n) && n >= 0 ? Math.floor(n) : null);
  const code = (s: string | null) => (s && /^[a-z]{2}$/i.test(s.trim()) ? s.trim() : null);
  return {
    ...f,
    niches: [...new Set(f.niches)].filter((s) => validSlugs.includes(s)).slice(0, 5),
    min_subs: int(f.min_subs),
    max_subs: int(f.max_subs),
    country: code(f.country)?.toUpperCase() ?? null,
    language: code(f.language)?.toLowerCase() ?? null,
    sort: ["subscribers", "growth", "newest"].includes(f.sort) ? f.sort : "subscribers",
    // Only letters/digits/spaces: keywords go into a PostgREST or() filter.
    keywords: f.keywords.map((k) => k.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").trim()).filter((k) => k.length >= 3).slice(0, 4),
  };
}
