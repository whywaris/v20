import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chunk, mapPool } from "@/lib/pool";
import { fetchChannelsById, fetchLatestVideos, parseDuration, type YtChannel } from "@/lib/youtube";

const today = () => new Date().toISOString().slice(0, 10); // UTC day
const VIDEO_CONCURRENCY = 8;

function channelRow(c: YtChannel) {
  const s = c.snippet;
  return {
    yt_channel_id: c.id,
    handle: (s.customUrl?.replace(/^@/, "") ?? c.id).toLowerCase(),
    title: s.title,
    summary: s.description.slice(0, 500),
    avatar_url: s.thumbnails.high?.url ?? s.thumbnails.default?.url ?? null,
    country: s.country ?? null,
    language: s.defaultLanguage ?? null,
    created_at_yt: s.publishedAt,
    subscribers: c.statistics.subscriberCount ? Number(c.statistics.subscriberCount) : null,
    total_views: Number(c.statistics.viewCount),
    video_count: Number(c.statistics.videoCount),
    last_synced_at: new Date().toISOString(),
  };
}

async function syncVideos(db: SupabaseClient, c: YtChannel, channelId: number) {
  const videos = await fetchLatestVideos(c.contentDetails.relatedPlaylists.uploads);
  if (!videos.length) return;
  const { error } = await db.from("videos").upsert(
    videos.map((v) => {
      const duration = parseDuration(v.contentDetails.duration);
      return {
        yt_video_id: v.id,
        channel_id: channelId,
        title: v.snippet.title,
        published_at: v.snippet.publishedAt,
        duration_seconds: duration,
        views: v.statistics.viewCount ? Number(v.statistics.viewCount) : null,
        is_short: duration > 0 && duration <= 180, // ponytail: guess by length, Shorts can be up to 3 min
        thumbnail_url: v.snippet.thumbnails.medium?.url ?? v.snippet.thumbnails.default?.url ?? null,
      };
    }),
    { onConflict: "yt_video_id" },
  );
  if (error) throw error;
}

// Upserts channels + today's snapshot (in chunks), then latest videos for channels picked by `wantVideos`,
// 8 at a time until `deadline`. Returns stored ids and how many video refreshes ran / were skipped.
export async function syncChannels(
  db: SupabaseClient,
  ytChannels: YtChannel[],
  wantVideos: (c: YtChannel) => boolean = () => true,
  deadline = Infinity,
) {
  ytChannels = [...new Map(ytChannels.map((c) => [c.id, c])).values()]; // same channel pasted twice
  const rows: { id: number; yt_channel_id: string; subscribers: number | null; total_views: number | null; video_count: number | null }[] = [];
  for (const part of chunk(ytChannels.map(channelRow), 500)) {
    const { data, error } = await db.from("channels").upsert(part, { onConflict: "yt_channel_id" })
      .select("id, yt_channel_id, subscribers, total_views, video_count");
    if (error) throw error;
    rows.push(...data);
  }

  const date = today();
  for (const part of chunk(rows, 1000)) {
    const { error } = await db.from("channel_stats_daily").upsert(
      part.map((r) => ({ channel_id: r.id, date, subscribers: r.subscribers, total_views: r.total_views, video_count: r.video_count })),
      { onConflict: "channel_id,date" },
    );
    if (error) throw error;
  }

  const idByYt = new Map(rows.map((r) => [r.yt_channel_id, r.id]));
  const targets = ytChannels.filter(wantVideos);
  const results = await mapPool(targets, VIDEO_CONCURRENCY, (c) => syncVideos(db, c, idByYt.get(c.id)!), deadline);
  const failed = results.filter((r) => "ok" in r && !r.ok);
  if (failed.length) console.error(`video sync failed for ${failed.length} channels`, "error" in failed[0] ? failed[0].error : "");
  return {
    ids: rows.map((r) => r.id),
    videosRefreshed: results.filter((r) => "ok" in r && r.ok).length,
    videosFailed: failed.length,
    videosSkipped: results.filter((r) => "skipped" in r).length,
  };
}

// Daily job. Stats for every channel (1 quota unit per 50). Videos (2 units each) only for channels with a
// new upload since yesterday, plus a rotating 1/7 so every channel's video views refresh weekly.
export async function syncAll(db: SupabaseClient, deadline = Date.now() + 240_000) {
  const known: { id: number; yt_channel_id: string; video_count: number | null }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("channels").select("id, yt_channel_id, video_count")
      .neq("status", "removed").order("id").range(from, from + 999);
    if (error) throw error;
    known.push(...data);
    if (data.length < 1000) break;
  }

  const found = await fetchChannelsById(known.map((k) => k.yt_channel_id));
  const prev = new Map(known.map((k) => [k.yt_channel_id, k]));
  const weekday = new Date().getUTCDay();
  const r = await syncChannels(db, found, (c) => {
    const p = prev.get(c.id)!;
    return Number(c.statistics.videoCount) !== p.video_count || p.id % 7 === weekday;
  }, deadline);

  const foundIds = new Set(found.map((c) => c.id));
  const gone = known.filter((k) => !foundIds.has(k.yt_channel_id)).map((k) => k.yt_channel_id);
  for (const part of chunk(gone, 200)) await db.from("channels").update({ status: "removed" }).in("yt_channel_id", part);

  const { error: growthError } = await db.rpc("refresh_growth");
  if (growthError) throw growthError;
  return { synced: found.length, removed: gone.length, videosRefreshed: r.videosRefreshed, videosFailed: r.videosFailed, videosSkipped: r.videosSkipped };
}
