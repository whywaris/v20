import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog: YouTube Niche Guides",
  description: "Guides on picking YouTube niches, AI avatar and faceless channels, and how channels make money.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("slug, title, description, published_at")
    .eq("status", "published").order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts?.length ? (
        <ul className="mt-6 divide-y">
          {posts.map((p) => (
            <li key={p.slug} className="py-5">
              <Link href={`/blog/${p.slug}`} className="text-xl font-semibold hover:underline">{p.title}</Link>
              {p.description && <p className="mt-1 text-neutral-600 dark:text-neutral-400">{p.description}</p>}
              {p.published_at && <p className="mt-1 text-xs text-neutral-500">{new Date(p.published_at).toISOString().slice(0, 10)}</p>}
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 text-neutral-500">No posts yet.</p>}
    </main>
  );
}
