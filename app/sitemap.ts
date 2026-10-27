import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { MIN_INDEXABLE, SITE, TOOLS } from "@/lib/seo";

export const revalidate = 86400;

// ponytail: one file holds up to 50k URLs; switch to generateSitemaps() past that.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ data: channels }, { data: niches }, { data: posts }] = await Promise.all([
    db.from("channels").select("handle, last_synced_at").eq("status", "active").limit(49_000),
    db.from("niche_stats").select("slug, is_indexable, channels, rpm_low"),
    db.from("posts").select("slug, updated_at").eq("status", "published"),
  ]);

  const indexableNiches = (niches ?? []).filter((n) => n.is_indexable || n.channels >= MIN_INDEXABLE);
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "daily") =>
    ({ url: `${SITE}${path}`, priority, changeFrequency });

  return [
    page("", 1),
    page("/niches", 0.8, "weekly"),
    page("/fastest-growing", 0.8),
    page("/outliers", 0.7),
    page("/pricing", 0.5, "monthly"),
    page("/tools", 0.6, "monthly"),
    ...TOOLS.map((t) => page(t.href, 0.7, "weekly")),
    page("/blog", 0.6, "weekly"),
    ...indexableNiches.flatMap((n) => [
      page(`/niche/${n.slug}`, 0.8),
      page(`/fastest-growing/${n.slug}`, 0.7),
      ...(n.rpm_low != null ? [page(`/youtube-rpm/${n.slug}`, 0.7, "weekly")] : []),
    ]),
    ...(posts ?? []).map((p) => ({ ...page(`/blog/${p.slug}`, 0.7, "monthly"), lastModified: p.updated_at })),
    ...(channels ?? []).map((c) => ({ ...page(`/channel/${c.handle}`, 0.6), lastModified: c.last_synced_at ?? undefined })),
  ];
}
