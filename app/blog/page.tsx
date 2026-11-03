import Link from 'next/link';
import { Metadata } from 'next';
import { PenLine } from 'lucide-react';
import BlogList from '@/components/blog/BlogList';
import BlogShell from '@/components/blog/BlogShell';
import { toCard } from '@/components/blog/PostCard';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'YouTube Niche Blog: RPM, Growth & Faceless Channel Guides · YT Niches',
  description: 'Data-driven guides, RPM benchmarks and case studies on growing and monetizing faceless YouTube channels.',
  alternates: { canonical: `${SITE_URL}/blog` },
};

// Refreshed every 5 minutes (scheduled posts appear on time); saving in /admin refreshes it immediately.
export const revalidate = 300;

export default async function BlogHubPage() {
  const posts = await getPublishedPosts();
  return (
    <BlogShell
      title="YouTube growth, RPM & niche playbooks"
      description="Practical guides and data breakdowns from 6,800+ small YouTube channels and 18,000+ outlier videos."
      categories={categoriesOf(posts)}
      crumbs={[{ name: 'Blog', href: '/blog' }]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'YT Niches Blog',
            url: `${SITE_URL}/blog`,
            blogPost: posts.slice(0, 20).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.publishedAt })),
          }),
        }}
      />
      {posts.length ? (
        <BlogList posts={posts.map(toCard)} />
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border-line-strong)] px-6 py-16 text-center">
          <PenLine className="mx-auto size-8 text-[var(--brand-mark)]" />
          <h2 className="mt-4 text-xl font-bold text-[var(--text-ink)]">New articles are on the way</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--text-muted)]">
            In the meantime, explore the channels and niches the guides are based on.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/channels" className="btn-accent inline-flex h-11 items-center rounded-full px-6 text-[14px]">Browse channels</Link>
            <Link href="/niche" className="inline-flex h-11 items-center rounded-full border border-[var(--border-line-strong)] px-6 text-[14px] font-semibold text-[var(--text-ink)]">Explore niches</Link>
          </div>
        </div>
      )}
    </BlogShell>
  );
}
