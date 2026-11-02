import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { VideoOutlierItem } from '@/types';

// In-memory server-side cache
let cachedOutliers: VideoOutlierItem[] | null = null;

function loadOutliers(): VideoOutlierItem[] {
  if (cachedOutliers) return cachedOutliers;
  const filePath = path.join(process.cwd(), 'data', 'unified_outliers.json');
  try {
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      cachedOutliers = raw.map((v: any) => ({
        id: v.id,
        videoId: v.videoId,
        title: v.title,
        thumbnail: v.thumbnail,
        views: v.views || 0,
        viewsFormatted: v.viewsFormatted,
        duration: v.duration,
        durationFormatted: v.durationFormatted,
        videoUrl: v.videoUrl,
        multiplier: v.multiplier || 1,
        publishDate: v.publishDate,
        channelId: v.channelId,
        channelTitle: v.channelTitle,
        channelHandle: v.channelHandle,
        channelSubsFormatted: v.channelSubsFormatted,
        format: v.format || 'faceless',
        category: v.category || 'General',
        tags: v.tags || []
      }));
      return cachedOutliers!;
    }
  } catch (err) {
    console.error('Error loading outliers in API:', err);
  }
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const category = (searchParams.get('category') || '').toLowerCase().trim();
  const multiplier = searchParams.get('multiplier') || '';
  const format = (searchParams.get('format') || '').toLowerCase().trim();
  const sort = searchParams.get('sort') || 'multiplier';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(12, parseInt(searchParams.get('limit') || '24', 10)));

  const allVideos = loadOutliers();

  const filtered = allVideos.filter((v) => {
    // 1. Search
    if (q) {
      const matchTitle = v.title?.toLowerCase().includes(q);
      const matchChannel = v.channelTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchChannel) return false;
    }

    // 2. Category
    if (category && category !== 'all niches') {
      const matchCat = (v.category || '').toLowerCase().includes(category) ||
                       (v.tags || []).some((t) => t.toLowerCase().includes(category));
      if (!matchCat) return false;
    }

    // 3. Multiplier
    if (multiplier === '20x' && (!v.multiplier || v.multiplier < 20)) return false;
    if (multiplier === '10x' && (!v.multiplier || v.multiplier < 10)) return false;
    if (multiplier === '5x' && (!v.multiplier || v.multiplier < 5)) return false;

    // 4. Format
    if (format && v.format !== format) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'views') return (b.views || 0) - (a.views || 0);
    if (sort === 'recent') {
      const dateA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const dateB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return dateB - dateA;
    }
    return (b.multiplier || 0) - (a.multiplier || 0);
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json(
    {
      videos: items,
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
