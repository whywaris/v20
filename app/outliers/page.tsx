import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { compact, duration, timeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Outlier YouTube Videos by Niche",
  description: "Videos getting many times more views than their channel's usual video. Find proven topics and titles in any niche.",
  alternates: { canonical: "/outliers" },
};

const FREE_ROWS = 5;
type Search = { niche?: string; min?: string; shorts?: string };

export default async function OutliersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { niche = "", min = "3", shorts = "" } = await searchParams;
  const minRatio = Math.max(1, Number(min) || 3);
  const v = await getViewer();
  const supabase = await createClient();

  const { data: niches } = await supabase.from("niches").select("id, slug, name").order("name");
  const nicheId = niches?.find((n) => n.slug === niche)?.id;
  const { data: inNiche } = nicheId ? await supabase.from("channel_niches").select("channel_id").eq("niche_id", nicheId) : { data: null };

  let q = supabase.from("video_outliers").select("*", { count: "exact" }).gte("ratio", minRatio).order("ratio", { ascending: false });
  if (inNiche) q = q.in("channel_id", inNiche.map((r) => r.channel_id));
  if (!shorts) q = q.eq("is_short", false);
  const { data: rows, count } = await q.limit(v.isPro ? 200 : FREE_ROWS);
  const locked = !v.isPro && (count ?? 0) > FREE_ROWS;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">Outlier videos</h1>
        <p className="mt-2 text-neutral-500">Videos that got far more views than their channel&apos;s median video. Proven topics you can learn from.</p>
      </header>

      <form className="flex flex-wrap gap-3">
        <select name="niche" defaultValue={niche} aria-label="Niche" className="rounded-md border bg-transparent px-3 py-2">
          <option value="">All niches</option>
          {niches?.map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}
        </select>
        <select name="min" defaultValue={String(minRatio)} aria-label="Minimum multiple" className="rounded-md border bg-transparent px-3 py-2">
          {[2, 3, 5, 10].map((r) => <option key={r} value={r}>{r}× or more</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="shorts" value="1" defaultChecked={!!shorts} /> Include Shorts</label>
        <button className="rounded-md border px-4 py-2">Apply</button>
      </form>

      {rows?.length ? (
        <ol className="divide-y rounded-lg border">
          {rows.map((r) => (
            <li key={r.yt_video_id} className="flex gap-4 p-4">
              {r.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumbnail_url} alt="" width={160} height={90} loading="lazy" className="hidden aspect-video w-40 shrink-0 rounded object-cover sm:block" />
              )}
              <div className="min-w-0 flex-1">
                <a href={`https://www.youtube.com/watch?v=${r.yt_video_id}`} target="_blank" rel="noopener" className="font-medium hover:underline">{r.title}</a>
                <p className="text-sm text-neutral-500">
                  <Link href={`/channel/${r.handle}`} className="hover:underline">{r.channel_title}</Link> · {compact(r.subscribers)} subs · {timeAgo(r.published_at)} · {duration(r.duration_seconds)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">{r.ratio}×</p>
                <p className="text-xs text-neutral-500">{compact(r.views)} vs {compact(r.median_views)}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : <p className="text-neutral-500">No outliers match these filters yet.</p>}

      {locked && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-xl font-semibold">+{(count ?? 0) - FREE_ROWS} more outlier videos</p>
          <p className="mt-1 text-sm text-neutral-500">Pro shows the full list with niche filters.</p>
          <Link href={v.user ? "/pricing" : "/login?next=/outliers"} className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
            {v.user ? "Upgrade to Pro" : "Log in"}
          </Link>
        </div>
      )}
    </main>
  );
}
