import { postDate, urlsetXml, xmlResponse } from '@/lib/sitemap';
import { getPublishedPosts } from '@/lib/posts';

export const dynamic = 'force-static';
export const revalidate = 86400; // also refreshed immediately when a post is saved in /admin

// Published posts only (Supabase + built-in fallbacks); drafts never appear.
export async function GET() {
  const posts = await getPublishedPosts();
  return xmlResponse(
    urlsetXml(
      posts.map((p) => ({
        path: `/blog/${encodeURIComponent(p.slug)}`,
        lastmod: postDate(p.date),
        changefreq: 'monthly' as const,
        priority: 0.7,
      }))
    )
  );
}
