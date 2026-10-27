import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compact } from "@/lib/format";
import { AddChannelsForm, AddNicheForm, AnalyzeForm, SyncButton } from "./forms";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const maxDuration = 300; // bulk add / analyze actions run up to ~4 minutes

// Access is enforced by middleware (/admin) and requireStaff() in every action.
export default async function AdminPage() {
  const supabase = await createClient();
  const [{ data: niches }, { data: recent }, { count: channelCount }, { count: userCount }, { count: unanalyzed }] = await Promise.all([
    supabase.from("niches").select("id, name").order("name"),
    supabase.from("channels").select("handle, title, subscribers, last_synced_at, status").order("created_at", { ascending: false }).limit(20),
    supabase.from("channels").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("channels").select("*", { count: "exact", head: true }).eq("status", "active").is("analyzed_at", null),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-neutral-500">
          {channelCount ?? 0} channels · {niches?.length ?? 0} niches · {userCount ?? 0} users ·{" "}
          <Link href="/admin/posts" className="underline">Blog posts</Link>
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-medium">Add channels</h2>
          <AddChannelsForm niches={niches ?? []} />
        </section>
        <section>
          <h2 className="mb-3 font-medium">Add niche</h2>
          <AddNicheForm niches={niches ?? []} />
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Daily sync</h2>
        <p className="text-sm text-neutral-500">Runs automatically every day at 03:00 UTC on Vercel. Each sync stores one stats snapshot per channel per day.</p>
        <SyncButton />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">AI analysis</h2>
        <p className="text-sm text-neutral-500">
          Detects links, the store page and offers, then writes the persona, title patterns and why it works.
          Runs daily (never-analyzed first). Empty = as many as fit in ~4 minutes (about 100); click again for more,
          or run <code>npm run analyze:all</code> on your computer for big batches.
        </p>
        <p className="text-sm font-medium">{unanalyzed ?? 0} channels not analyzed yet</p>
        <AnalyzeForm />
      </section>

      <section>
        <h2 className="mb-3 font-medium">Recently added</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-500"><tr><th className="py-2">Channel</th><th>Subs</th><th>Status</th><th>Last sync</th></tr></thead>
          <tbody>
            {recent?.map((c) => (
              <tr key={c.handle} className="border-t">
                <td className="py-2">
                  <Link href={`/channel/${c.handle}`} className="hover:underline">{c.title}</Link>
                  <Link href={`/admin/channel/${c.handle}`} className="ml-2 text-xs text-neutral-500 underline">edit</Link>
                </td>
                <td>{compact(c.subscribers)}</td>
                <td>{c.status}</td>
                <td>{c.last_synced_at ? new Date(c.last_synced_at).toISOString().slice(0, 16).replace("T", " ") : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
