import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchChannelsById, fetchLatestVideos, parseDuration, type YtChannel } from "@/lib/youtube";

const today = () => new Date().toISOString().slice(0, 10); // UTC day

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

// Upserts channels + today's snapshot + latest videos. Returns the stored channel ids.
// ponytail: 2 extra quota units per channel for videos; at ~4k channels split videos onto a weekly job.
export async function syncChannels(db: SupabaseClient, ytChannels: YtChannel[]): Promise<number[]> {
  if (!ytChannels.length) return [];
  const { data: rows, error } = await db
    .from("channels")
    .upsert(ytChannels.map(channelRow), { onConflict: "yt_channel_id" })
    .select("id, yt_channel_id, subscribers, total_views, video_count");
  if (error) throw error;

  const date = today();
  const { error: statsError } = await db.from("channel_stats_daily").upsert(
    rows.map((r) => ({ channel_id: r.id, date, subscribers: r.subscribers, total_views: r.total_views, video_count: r.video_count })),
    { onConflict: "channel_id,date" },
  );
  if (statsError) throw statsError;

  const idByYt = new Map(rows.map((r) => [r.yt_channel_id, r.id as number]));
  for (const c of ytChannels) {
    const videos = await fetchLatestVideos(c.contentDetails.relatedPlaylists.uploads);
    if (!videos.length) continue;
    const { error: vErr } = await db.from("videos").upsert(
      videos.map((v) => {
        const duration = parseDuration(v.contentDetails.duration);
        return {
          yt_video_id: v.id,
          channel_id: idByYt.get(c.id),
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
    if (vErr) throw vErr;
  }
  return rows.map((r) => r.id as number);
}

// Daily job: refresh every non-removed channel; mark channels YouTube no longer returns as removed.
export async function syncAll(db: SupabaseClient) {
  const { data, error } = await db.from("channels").select("yt_channel_id").neq("status", "removed");
  if (error) throw error;
  const ids = data.map((r) => r.yt_channel_id as string);
  const found = await fetchChannelsById(ids);
  await syncChannels(db, found);

  const foundIds = new Set(found.map((c) => c.id));
  const gone = ids.filter((id) => !foundIds.has(id));
  if (gone.length) await db.from("channels").update({ status: "removed" }).in("yt_channel_id", gone);

  const { error: growthError } = await db.rpc("refresh_growth");
  if (growthError) throw growthError;
  return { synced: found.length, removed: gone.length };
}
