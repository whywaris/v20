import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { marked } from "marked";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth";
import { JsonLd } from "@/components/channel-card";
import { AdSlot } from "@/components/ad-slot";
import { SITE } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const getPost = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*, niches(slug, name)").eq("slug", slug).maybeSingle();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description ?? undefined,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description ?? undefined, images: p.cover_url ? [p.cover_url] : [] },
    robots: { index: p.status === "published" }, // staff can preview drafts
  };
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const viewer = await getViewer();
  const niche = p.niches as { slug: string; name: string } | null;
  // Posts are written by staff only (RLS), so their markdown/HTML is trusted.
  const html = await marked.parse(p.body_md);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE}/blog` },
            { "@type": "ListItem", position: 2, name: p.title, item: `${SITE}/blog/${p.slug}` },
          ] },
          { "@type": "Article", headline: p.title, description: p.description, image: p.cover_url ?? undefined,
            datePublished: p.published_at, dateModified: p.updated_at, mainEntityOfPage: `${SITE}/blog/${p.slug}` },
        ],
      }} />
      <nav className="text-sm text-neutral-500"><Link href="/blog" className="hover:underline">Blog</Link></nav>
      {p.status !== "published" && <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">Draft preview (only staff can see this).</p>}
      <header>
        <h1 className="text-4xl font-bold">{p.title}</h1>
        {p.published_at && <p className="mt-2 text-sm text-neutral-500">{new Date(p.published_at).toISOString().slice(0, 10)}</p>}
      </header>
      {p.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover_url} alt="" className="w-full rounded-lg" />
      )}
      <article className="prose-post" dangerouslySetInnerHTML={{ __html: html }} />
      <AdSlot hidden={viewer.isPro} />
      {niche && (
        <p className="rounded-lg border p-4 text-sm">
          Explore <Link href={`/niche/${niche.slug}`} className="underline">{niche.name} channels</Link> with daily stats and analysis.
        </p>
      )}
    </main>
  );
}
