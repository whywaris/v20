import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CHANNEL_CARD_COLUMNS, ChannelCard, type ChannelCardData } from "@/components/channel-card";

export const metadata: Metadata = { title: "Saved channels", robots: { index: false } };

export default async function SavedPage() {
  const v = await getViewer();
  if (!v.user) redirect("/login?next=/saved");
  const supabase = await createClient();
  const { data } = await supabase.from("saved_channels")
    .select(`created_at, channels(${CHANNEL_CARD_COLUMNS})`).order("created_at", { ascending: false });
  const channels = (data ?? []).map((r) => r.channels as unknown as ChannelCardData).filter(Boolean);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Saved channels</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {channels.length}{v.isPro ? "" : " of 10"} saved.{" "}
        {!v.isPro && <Link href="/pricing" className="underline">Pro saves unlimited channels.</Link>}
      </p>
      {channels.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{channels.map((c) => <ChannelCard key={c.handle} c={c} />)}</div>
      ) : (
        <p className="mt-6 text-neutral-500">Nothing saved yet. Use ☆ Save on any channel page.</p>
      )}
    </main>
  );
}
