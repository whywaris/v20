import type { Channel } from '@/types';

// The slim channel object sent to the browser for ChannelCard / ChannelTableRow (home page and /api/channels).
// Keep it to the fields the card actually renders so the page payload stays small.
export function toCardChannel(c: Channel): Channel {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    thumbnail: c.thumbnail,
    subscribers: c.subscribers || 0,
    avgViews: c.avgViews || 0,
    totalViews: c.totalViews || 0,
    totalVideos: c.totalVideos || 0,
    format: c.format || 'faceless',
    avatarStyle: c.avatarStyle || null,
    monetization: Boolean(c.monetization),
    estimatedRpm: c.estimatedRpm || { min: 4, max: 12, avg: 7.5 },
    estimatedMonthlyRevenueUsd: c.estimatedMonthlyRevenueUsd || null,
    categories: c.categories || [],
    tags: c.tags || [],
    sells: c.sells,
    offers: c.offers?.length ? c.offers.map((o) => ({ title: o.title, type: o.type })) : undefined,
    medianLengthSeconds: c.medianLengthSeconds ?? null,
    medianLengthFormatted: c.medianLengthFormatted || null,
    // Per-video durations are omitted: in the data they're the channel's median length, not real per-video values.
    popularVideos: (c.popularVideos || []).slice(0, 3).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      viewsFormatted: v.viewsFormatted,
      videoUrl: v.videoUrl,
    })),
  };
}
