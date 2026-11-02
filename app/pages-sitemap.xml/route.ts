import { BUILD_TIME, urlsetXml, xmlResponse, type SitemapEntry } from '@/lib/sitemap';

export const dynamic = 'force-static';
export const revalidate = 86400;

// Indexable top-level pages only. Not listed: /swipe-file (redirects), /saved and /admin (private).
const PAGES: Omit<SitemapEntry, 'lastmod'>[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/niche', changefreq: 'daily', priority: 0.9 },
  { path: '/outliers', changefreq: 'daily', priority: 0.9 },
  { path: '/blog', changefreq: 'weekly', priority: 0.8 },
  { path: '/about', changefreq: 'monthly', priority: 0.6 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/privacy', changefreq: 'monthly', priority: 0.4 },
  { path: '/terms', changefreq: 'monthly', priority: 0.4 },
  { path: '/disclaimer', changefreq: 'monthly', priority: 0.4 },
  { path: '/cookies', changefreq: 'monthly', priority: 0.4 },
];

export function GET() {
  return xmlResponse(urlsetXml(PAGES.map((p) => ({ ...p, lastmod: BUILD_TIME }))));
}
