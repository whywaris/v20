import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { csvRow } from "@/lib/csv";
import { SITE } from "@/lib/seo";

// Pro-only CSV of channels. Same filters as the home page: ?q=&niche=&sort=
export async function GET(request: Request) {
  const v = await getViewer();
  if (!v.user) return NextResponse.redirect(new URL("/login?next=/pricing", request.url));
  if (!v.isPro) return NextResponse.redirect(new URL("/pricing", request.url));

  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const sort = ({ views: "total_views", newest: "created_at_yt", name: "title", growth: "subs_gain_30d" } as Record<string, string>)[params.get("sort") ?? ""] ?? "subscribers";

  const supabase = await createClient();
  const { data: niche } = params.get("niche")
    ? await supabase.from("niches").select("id, slug").eq("slug", params.get("niche")!).maybeSingle()
    : { data: null };

  let query = supabase.from("channels")
    .select(`handle, title, tagline, subscribers, total_views, video_count, subs_gain_30d, views_gain_30d, country, language, is_faceless, is_ai_avatar, created_at_yt,
      channel_niches${niche ? "!inner" : ""}(niche_id, niches(slug)), offers(name, price, platform)`)
    .eq("status", "active")
    .order(sort, { ascending: sort === "title", nullsFirst: false })
    .limit(5000);
  if (niche) query = query.eq("channel_niches.niche_id", niche.id);
  if (q) query = query.ilike("title", `%${q.replace(/[%_\\]/g, "\\$&")}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = {
    handle: string; title: string; tagline: string | null; subscribers: number | null; total_views: number | null; video_count: number | null;
    subs_gain_30d: number | null; views_gain_30d: number | null; country: string | null; language: string | null;
    is_faceless: boolean | null; is_ai_avatar: boolean | null; created_at_yt: string | null;
    channel_niches: { niches: { slug: string } | null }[];
    offers: { name: string; price: number | null; platform: string | null }[];
  };
  const lines = [csvRow(["handle", "title", "url", "tagline", "niches", "subscribers", "total_views", "videos", "subs_gain_30d", "views_gain_30d",
    "country", "language", "faceless", "ai_avatar", "created", "offers"])];
  for (const c of data as unknown as Row[]) {
    lines.push(csvRow([c.handle, c.title, `${SITE}/channel/${c.handle}`, c.tagline, c.channel_niches.map((n) => n.niches?.slug), c.subscribers,
      c.total_views, c.video_count, c.subs_gain_30d, c.views_gain_30d, c.country, c.language, c.is_faceless, c.is_ai_avatar,
      c.created_at_yt?.slice(0, 10), c.offers.map((o) => `${o.name}${o.price != null ? ` $${o.price}` : ""}${o.platform ? ` (${o.platform})` : ""}`)]));
  }
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="channels${niche ? `-${niche.slug}` : ""}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
