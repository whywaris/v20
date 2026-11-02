import { dataLastmod, readData, urlsetXml, xmlResponse } from '@/lib/sitemap';
import { nicheChannelCounter } from '@/lib/niche-match';
import type { Channel, Niche } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 86400;

// Every niche page that renders as itself and is indexable. Niches with no matching channels are noindex
// (see app/niche/[slug]/page.tsx), so they're left out.
export function GET() {
  const niches = readData<Niche>('unified_niches.json');
  const countChannels = nicheChannelCounter(readData<Channel>('unified_channels.json'));
  const lastmod = dataLastmod('unified_niches.json');
  return xmlResponse(
    urlsetXml(
      niches
        .filter((n) => countChannels(n) > 0)
        .sort((a, b) => b.channelCount - a.channelCount)
        .map((n) => ({ path: `/niche/${encodeURIComponent(n.slug)}`, lastmod, changefreq: 'weekly' as const, priority: 0.8 }))
    )
  );
}
