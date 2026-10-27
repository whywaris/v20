import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { MIN_INDEXABLE, SITE } from "@/lib/seo";

export const revalidate = 86400;

// ponytail: one file holds up to 50k URLs; switch to generateSitemaps() past that.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ data: channels }, { data: niches }] = await Promise.all([
    db.from("channels").select("handle, last_synced_at").eq("status", "active").limit(49_000),
    db.from("niches").select("slug, is_indexable, channel_niches(count)"),
  ]);

  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/niches`, changeFrequency: "weekly", priority: 0.8 },
    ...(niches ?? [])
      .filter((n) => n.is_indexable || ((n.channel_niches as unknown as { count: number }[])[0]?.count ?? 0) >= MIN_INDEXABLE)
      .map((n) => ({ url: `${SITE}/niche/${n.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...(channels ?? []).map((c) => ({
      url: `${SITE}/channel/${c.handle}`,
      lastModified: c.last_synced_at ?? undefined,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
