import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL } from '@/lib/site';

// Yoast/RankMath-style sitemaps: /sitemap.xml is an index of the sub-sitemaps below.
export const SUB_SITEMAPS = ['pages-sitemap.xml', 'niches-sitemap.xml', 'channels-sitemap.xml', 'blog-sitemap.xml'] as const;

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
export type SitemapEntry = { path: string; lastmod: Date; changefreq: ChangeFreq; priority?: number };

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const iso = (d: Date) => d.toISOString();
export const absolute = (p: string) => (p === '/' ? SITE_URL : `${SITE_URL}${p}`);

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) =>
      [
        '  <url>',
        `    <loc>${escapeXml(absolute(e.path))}</loc>`,
        `    <lastmod>${iso(e.lastmod)}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        e.priority != null ? `    <priority>${e.priority.toFixed(1)}</priority>` : null,
        '  </url>',
      ].filter(Boolean).join('\n')
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexXml(items: { file: string; lastmod: Date }[]): string {
  const maps = items
    .map((i) => `  <sitemap>\n    <loc>${escapeXml(absolute(`/${i.file}`))}</loc>\n    <lastmod>${iso(i.lastmod)}</lastmod>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

const DATA_DIR = path.join(process.cwd(), 'data');
export const BUILD_TIME = new Date();

// "Oct 24, 2026" → that date at 00:00 UTC (not the server's local time zone); build time if unparseable.
export const postDate = (d: string) => {
  const t = Date.parse(`${d} 00:00 UTC`);
  return isNaN(t) ? BUILD_TIME : new Date(t);
};

export function readData<T>(file: string): T[] {
  const p = path.join(DATA_DIR, file);
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf8')) as T[]) : [];
}

// When the data file last changed; falls back to build time if the platform resets file dates.
export function dataLastmod(file: string): Date {
  try {
    const m = fs.statSync(path.join(DATA_DIR, file)).mtime;
    return m.getFullYear() >= 2020 && m <= new Date() ? m : BUILD_TIME;
  } catch {
    return BUILD_TIME;
  }
}
