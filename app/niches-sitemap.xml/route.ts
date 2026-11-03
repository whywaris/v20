import { dataLastmod, urlsetXml, xmlResponse } from '@/lib/sitemap';
import { getChannels, getNiches } from '@/lib/data';
import { nicheChannelCounter } from '@/lib/niche-match';

export const dynamic = 'force-static';
export const revalidate = 86400;

// Every niche page that renders as itself and is indexable. Niches with no matching channels are noindex
// (see app/niche/[slug]/page.tsx), so they're left out.
export async function GET() {
  const niches = await getNiches();
  const countChannels = nicheChannelCounter(await getChannels());
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
