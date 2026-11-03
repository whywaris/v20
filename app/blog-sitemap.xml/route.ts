import { BUILD_TIME, urlsetXml, xmlResponse } from '@/lib/sitemap';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';

export const dynamic = 'force-static';
export const revalidate = 86400; // also refreshed immediately when a post is saved in /admin

// Live posts (drafts and scheduled posts never appear) and their category pages.
export async function GET() {
  const posts = await getPublishedPosts();
  const lastmod = (iso: string | null) => (iso ? new Date(iso) : BUILD_TIME);
  return xmlResponse(
    urlsetXml([
      ...posts.map((p) => ({ path: `/blog/${encodeURIComponent(p.slug)}`, lastmod: lastmod(p.updatedAt), changefreq: 'monthly' as const, priority: 0.7 })),
      ...categoriesOf(posts).map((c) => ({
        path: `/blog/category/${c.slug}`,
        lastmod: lastmod(posts.find((p) => p.categorySlug === c.slug)?.publishedAt ?? null),
        changefreq: 'weekly' as const,
        priority: 0.5,
      })),
    ])
  );
}
