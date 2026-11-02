import { dataLastmod, readData, urlsetXml, xmlResponse } from '@/lib/sitemap';
import type { Channel } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 86400;

// All channel pages, biggest first. IDs are URL-encoded (some are non-ASCII or already contain "%"),
// matching how /channel/[handle] decodes them. ponytail: one file holds up to 50,000 URLs; split if the library grows past that.
export function GET() {
  const lastmod = dataLastmod('unified_channels.json');
  const channels = readData<Channel>('unified_channels.json')
    .filter((c) => c.id || c.handle)
    .sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));
  return xmlResponse(
    urlsetXml(
      channels.map((c) => ({
        path: `/channel/${encodeURIComponent(c.id || c.handle.replace(/^@/, ''))}`,
        lastmod,
        changefreq: 'weekly' as const,
        priority: 0.6,
      }))
    )
  );
}
