import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "All YouTube Niches",
  description: "Browse YouTube niches and the channels in each one, with daily stats and growth.",
  alternates: { canonical: "/niches" },
};

export default async function NichesPage() {
  const supabase = await createClient();
  const { data: niches } = await supabase.from("niches").select("slug, name, description, channel_niches(count)").order("name");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">All YouTube niches</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {niches?.map((n) => (
          <li key={n.slug}>
            <Link href={`/niche/${n.slug}`} className="block h-full rounded-lg border p-4 hover:border-neutral-400">
              <h2 className="font-medium">{n.name}</h2>
              <p className="text-sm text-neutral-500">{(n.channel_niches as unknown as { count: number }[])[0]?.count ?? 0} channels</p>
              {n.description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{n.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
