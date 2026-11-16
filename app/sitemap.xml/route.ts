import { BUILD_TIME, postDate, sitemapIndexXml, xmlResponse } from '@/lib/sitemap';
import { getPublishedPosts } from '@/lib/posts';

// Generated at build time and refreshed once a day.
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const newestPost = (await getPublishedPosts()).map((p) => postDate(p.date)).sort((a, b) => +b - +a)[0];
  return xmlResponse(
    sitemapIndexXml([
      { file: 'pages-sitemap.xml', lastmod: BUILD_TIME },
      { file: 'blog-sitemap.xml', lastmod: newestPost ?? BUILD_TIME },
    ])
  );
}
