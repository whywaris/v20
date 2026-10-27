import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import { CHANNEL_CARD_COLUMNS, ChannelCard, type ChannelCardData } from "@/components/channel-card";

const FREE_LIMIT = 12; // logged-out visitors see this many, like the reference site
const PAGE_SIZE = 48;
const SORTS = {
  subs: { column: "subscribers", ascending: false, label: "Subscribers" },
  growth: { column: "subs_gain_30d", ascending: false, label: "Growth (30 days)" },
  views: { column: "total_views", ascending: false, label: "Total views" },
  newest: { column: "created_at_yt", ascending: false, label: "Newest channels" },
  name: { column: "title", ascending: true, label: "Name (A–Z)" },
} as const;

// Search/filter/sort URLs all canonicalize to the home page.
export const metadata: Metadata = { alternates: { canonical: "/" } };

type Search ={ q?: string; niche?: string; sort?: string; page?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", niche = "", sort = "subs", page = "1" } = await searchParams;
  const sortBy = SORTS[sort as keyof typeof SORTS] ?? SORTS.subs;
  const pageNum = Math.max(1, Number(page) || 1);

  const supabase = await createClient();
  const viewer = await getViewer();
  const user = viewer.user;
  const { data: niches } = await supabase.from("niches").select("id, slug, name").order("name");
  const nicheId = niches?.find((n) => n.slug === niche)?.id;

  let query = supabase
    .from("channels")
    .select(nicheId ? `${CHANNEL_CARD_COLUMNS}, channel_niches!inner(niche_id)` : CHANNEL_CARD_COLUMNS, { count: "exact" })
    .eq("status", "active")
    .order(sortBy.column, { ascending: sortBy.ascending, nullsFirst: false });
  if (nicheId) query = query.eq("channel_niches.niche_id", nicheId);
  if (q.trim()) query = query.ilike("title", `%${q.trim().replace(/[%_\\]/g, "\\$&")}%`);
  const from = user ? (pageNum - 1) * PAGE_SIZE : 0;
  const { data, count } = await query.range(from, from + (user ? PAGE_SIZE : FREE_LIMIT) - 1);
  const channels = (data ?? []) as unknown as ChannelCardData[];
  const total = count ?? 0;
  const pageHref = (p: number) => `/?${new URLSearchParams({ ...(q && { q }), ...(niche && { niche }), sort, page: String(p) })}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">YouTube channels in every niche</h1>
      <p className="mt-3 text-neutral-500">Daily stats, latest uploads, what each channel sells and why it works. {total} channels.</p>

      <form action="/ask" className="mt-8 flex flex-wrap gap-3 rounded-lg border p-4">
        <label className="w-full text-sm font-medium" htmlFor="ask-q">Ask the library a question</label>
        <input id="ask-q" name="q" maxLength={500} placeholder="e.g. faceless niches where channels sell ebooks" className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2" />
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Ask</button>
      </form>

      <form className="mt-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Search channels" aria-label="Search channels" className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2" />
        <select name="niche" defaultValue={niche} aria-label="Niche" className="rounded-md border bg-transparent px-3 py-2">
          <option value="">All niches</option>
          {niches?.map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort by" className="rounded-md border bg-transparent px-3 py-2">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
        <button className="rounded-md border px-4 py-2">Apply</button>
        {user && (
          <a href={`/api/export?${new URLSearchParams({ ...(q && { q }), ...(niche && { niche }), sort })}`} className="rounded-md border px-4 py-2 text-sm leading-6">
            Export CSV{viewer.isPro ? "" : " (Pro)"}
          </a>
        )}
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((c) => <ChannelCard key={c.handle} c={c} />)}
      </div>
      {!channels.length && <p className="mt-6 text-neutral-500">No channels found.</p>}

      {!user && total > FREE_LIMIT && (
        <div className="mt-8 rounded-lg border border-dashed p-6 text-center">
          <p className="text-xl font-semibold">+{total - FREE_LIMIT} more channels</p>
          <p className="mt-1 text-sm text-neutral-500">Log in with Google to see every channel, growth charts and analysis. Free.</p>
          <Link href="/login" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Unlock all channels</Link>
        </div>
      )}

      {user && total > PAGE_SIZE && (
        <nav className="mt-8 flex justify-center gap-3 text-sm" aria-label="Pages">
          {pageNum > 1 && <Link href={pageHref(pageNum - 1)} className="rounded-md border px-3 py-1.5">Previous</Link>}
          <span className="px-3 py-1.5 text-neutral-500">Page {pageNum} of {Math.ceil(total / PAGE_SIZE)}</span>
          {pageNum * PAGE_SIZE < total && <Link href={pageHref(pageNum + 1)} className="rounded-md border px-3 py-1.5">Next</Link>}
        </nav>
      )}

      <p className="mt-12 text-sm">
        <Link href="/niches" className="underline">Browse all niches</Link>
        {" · "}
        <Link href="/fastest-growing" className="underline">Fastest growing channels</Link>
        {" · "}
        <Link href="/tools/niche-finder" className="underline">Niche finder</Link>
      </p>
    </main>
  );
}
