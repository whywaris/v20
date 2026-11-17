import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import AdSlot from '@/components/ads/AdSlot';
import BlogEmpty from '@/components/blog/BlogEmpty';
import BlogList from '@/components/blog/BlogList';
import PostCard, { toCard } from '@/components/blog/PostCard';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

const TITLE = 'YT Niches - Find Most Profitable YouTube Niches';
const DESCRIPTION =
  'An independent blog about YouTube niche research, faceless channels, outlier videos and monetization, written by Waris Jamil.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/`, siteName: 'YT Niches', type: 'website' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

// Refreshed every 5 minutes (scheduled posts appear on time); saving a post in /admin refreshes it immediately.
export const revalidate = 300;

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const categories = categoriesOf(posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'YT Niches', url: `${SITE_URL}/`, description: DESCRIPTION }),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="relative mx-auto max-w-3xl py-14 text-center sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-64 max-w-xl rounded-full bg-[var(--brand-accent)]/15 blur-3xl" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
            <span className="size-1.5 rounded-full bg-emerald-500" /> The YT Niches blog
          </span>
          <h1 className="relative mt-6 text-[2.4rem] font-bold leading-[1.05] tracking-tight text-[var(--text-ink)] sm:text-6xl">
            The playbook for <span className="text-[var(--brand-accent)]">profitable YouTube niches</span>
          </h1>
          <p className="relative mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)] sm:text-lg">
            Practical guides on choosing a niche that pays, growing a faceless channel and turning views into income.
          </p>
        </section>

        <AdSlot format="horizontal" className="mb-10" />

        <section className="pb-12" aria-label="Latest articles">
          {posts.length ? <BlogList posts={posts.map(toCard)} /> : <BlogEmpty />}
        </section>

        {/* One row per category with its newest articles, once a category has enough to fill a row */}
        {categories
          .filter((c) => c.count >= 3)
          .slice(0, 3)
          .map((c) => (
            <section key={c.slug} className="py-10" aria-labelledby={`cat-${c.slug}`}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h2 id={`cat-${c.slug}`} className="text-2xl font-bold tracking-tight text-[var(--text-ink)]">{c.name}</h2>
                <Link href={`/blog/category/${c.slug}`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--brand-mark)] hover:underline">
                  All {c.count} articles <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts
                  .filter((p) => p.categorySlug === c.slug)
                  .slice(0, 3)
                  .map((p) => (
                    <PostCard key={p.slug} post={toCard(p)} />
                  ))}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}
