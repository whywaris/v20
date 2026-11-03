import { NextRequest, NextResponse } from 'next/server';
import { toCardChannel } from '@/lib/card-channel';
import { getChannels } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const category = (searchParams.get('category') || '').toLowerCase().trim();
  const format = (searchParams.get('format') || '').toLowerCase().trim();
  const subs = searchParams.get('subscribers') || '';
  const monetized = searchParams.get('monetized') || '';
  const sort = searchParams.get('sort') || 'subscribers';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(12, parseInt(searchParams.get('limit') || '24', 10)));

  // ponytail: maps ~7k channels per request (a few ms); cache by overrides version if this shows up in profiles.
  const allChannels = (await getChannels()).map(toCardChannel);

  // Filter channels
  const filtered = allChannels.filter((c) => {
    // 1. Search
    if (q) {
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchHandle = c.handle?.toLowerCase().includes(q);
      const matchCat = (c.categories || []).some((cat) => cat.toLowerCase().includes(q)) ||
                       (c.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchHandle && !matchCat) return false;
    }

    // 2. Category
    if (category) {
      const matchCat = (c.categories || []).some((cat) => cat.toLowerCase().includes(category)) ||
                       (c.tags || []).some((t) => t.toLowerCase().includes(category));
      if (!matchCat) return false;
    }

    // 3. Format
    if (format) {
      if (format === 'avatar' && c.format !== 'avatar') return false;
      if (format === 'faceless' && c.format === 'avatar') return false;
    }

    // 4. Subscribers
    if (subs === 'under10k' && c.subscribers >= 10000) return false;
    if (subs === '10k-50k' && (c.subscribers < 10000 || c.subscribers > 50000)) return false;
    if (subs === '50k-200k' && (c.subscribers < 50000 || c.subscribers > 200000)) return false;
    if (subs === '200k+' && c.subscribers < 200000) return false;

    // 5. Monetization
    if (monetized === 'yes' && !c.monetization) return false;
    if (monetized === 'no' && c.monetization) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'views') return (b.avgViews || 0) - (a.avgViews || 0);
    if (sort === 'revenue') return (b.estimatedMonthlyRevenueUsd || 0) - (a.estimatedMonthlyRevenueUsd || 0);
    if (sort === 'videos') return (b.totalVideos || 0) - (a.totalVideos || 0);
    return (b.subscribers || 0) - (a.subscribers || 0);
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json(
    {
      channels: items,
      total,
      page,
      limit,
      totalPages
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
