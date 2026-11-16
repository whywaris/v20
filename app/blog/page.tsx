import { Metadata } from 'next';
import BlogEmpty from '@/components/blog/BlogEmpty';
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
      description="Practical guides on choosing a profitable niche, growing a faceless channel and monetizing it."
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
      {posts.length ? <BlogList posts={posts.map(toCard)} /> : <BlogEmpty />}
    </BlogShell>
  );
}
