// YouTube Data API v3. Every call here costs 1 quota unit (free quota: 10,000/day).
const API = "https://www.googleapis.com/youtube/v3";

export type ChannelRef = { id: string } | { handle: string } | { username: string };

// Accepts a channel URL, @handle, bare handle or UC... id.
export function parseChannelInput(raw: string): ChannelRef | null {
  const s = raw.trim();
  if (!s) return null;
  const id = s.match(/(?:^|\/channel\/)(UC[\w-]{22})(?:[/?#]|$)/);
  if (id) return { id: id[1] };
  const handle = s.match(/(?:^|youtube\.com\/)@([\w.-]{3,30})(?:[/?#]|$)/) ?? s.match(/^([\w.-]{3,30})$/);
  if (handle) return { handle: handle[1] };
  const user = s.match(/youtube\.com\/user\/([\w.-]+)/);
  if (user) return { username: user[1] };
  return null; // legacy /c/ URLs can't be resolved by the API
}

// ISO 8601 duration ("PT1H2M3S") -> seconds.
export function parseDuration(iso: string): number {
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [, d, h, min, sec] = m.map((x) => Number(x ?? 0));
  return d * 86400 + h * 3600 + min * 60 + sec;
}

async function yt<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY! });
  const res = await fetch(`${API}/${path}?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

export type YtChannel = {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    country?: string;
    defaultLanguage?: string;
    thumbnails: Record<string, { url: string }>;
  };
  statistics: { subscriberCount?: string; viewCount: string; videoCount: string };
  contentDetails: { relatedPlaylists: { uploads: string } };
};

const CHANNEL_PARTS = "snippet,statistics,contentDetails";

// Up to 50 ids per call.
export async function fetchChannelsById(ids: string[]): Promise<YtChannel[]> {
  const out: YtChannel[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await yt<{ items?: YtChannel[] }>("channels", { part: CHANNEL_PARTS, id: ids.slice(i, i + 50).join(",") });
    out.push(...(r.items ?? []));
  }
  return out;
}

export async function resolveChannel(ref: ChannelRef): Promise<YtChannel | null> {
  const params: Record<string, string> =
    "id" in ref ? { id: ref.id } : "handle" in ref ? { forHandle: `@${ref.handle}` } : { forUsername: ref.username };
  const r = await yt<{ items?: YtChannel[] }>("channels", { part: CHANNEL_PARTS, ...params });
  return r.items?.[0] ?? null;
}

export type YtVideo = {
  id: string;
  snippet: { title: string; publishedAt: string; thumbnails: Record<string, { url: string }> };
  contentDetails: { duration: string };
  statistics: { viewCount?: string };
};

// Latest uploads of one channel: 2 units.
export async function fetchLatestVideos(uploadsPlaylistId: string, max = 10): Promise<YtVideo[]> {
  const list = await yt<{ items?: { contentDetails: { videoId: string } }[] }>("playlistItems", {
    part: "contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(max),
  }).catch(() => ({ items: [] })); // channel with no uploads returns 404
  const ids = (list.items ?? []).map((i) => i.contentDetails.videoId);
  if (!ids.length) return [];
  const r = await yt<{ items?: YtVideo[] }>("videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") });
  return r.items ?? [];
}
