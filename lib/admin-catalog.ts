// What the admin may change on a channel or niche, and how the admin list shows edits. Pure, so it can be tested.
import type { Override } from './overrides.ts';

type Body = Record<string, unknown>;
export type EditStatus = 'edited' | 'hidden' | 'new' | null;

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);
const num = (v: unknown) => (v === '' || v == null || !Number.isFinite(Number(v)) || Number(v) < 0 ? undefined : Number(v));
const list = (v: unknown) =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 20);
const url = (v: unknown) => {
  const s = text(v, 500);
  return s && /^https:\/\//i.test(s) ? s : undefined;
};
const drop = (o: Body) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export const handleId = (handle: string) => handle.replace(/^@/, '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

/** Only these channel fields can be edited; anything else in the request is ignored. */
export function cleanChannelEdit(b: Body) {
  const handle = text(b.handle, 100);
  return drop({
    title: text(b.title, 200),
    handle: handle ? `@${handle.replace(/^@/, '')}` : undefined,
    thumbnail: url(b.thumbnail),
    youtubeUrl: url(b.youtubeUrl),
    subscribers: num(b.subscribers),
    avgViews: num(b.avgViews),
    estimatedMonthlyRevenueUsd: num(b.estimatedMonthlyRevenueUsd),
    format: ['avatar', 'faceless', 'documentary'].includes(b.format as string) ? b.format : undefined,
    monetization: typeof b.monetization === 'boolean' ? b.monetization : undefined,
    categories: b.categories !== undefined ? list(b.categories) : undefined,
  });
}

/** A brand-new channel needs a title and handle; its id comes from the handle. */
export function newChannel(b: Body) {
  const edit = cleanChannelEdit(b);
  if (!edit.title || !edit.handle) return { error: 'Title and handle are required' } as const;
  const id = handleId(edit.handle as string);
  if (!id) return { error: 'Handle must contain letters or numbers' } as const;
  return {
    id,
    data: {
      id,
      title: edit.title,
      handle: edit.handle,
      youtubeUrl: edit.youtubeUrl ?? `https://www.youtube.com/@${id}`,
      thumbnail: edit.thumbnail ?? null,
      subscribers: edit.subscribers ?? 0,
      avgViews: edit.avgViews ?? 0,
      totalViews: 0,
      totalVideos: 0,
      format: edit.format ?? 'faceless',
      monetization: edit.monetization ?? false,
      estimatedMonthlyRevenueUsd: edit.estimatedMonthlyRevenueUsd ?? null,
      categories: (edit.categories as string[] | undefined)?.length ? edit.categories : ['General'],
      tags: [],
      popularVideos: [],
    },
  } as const;
}

export const nicheSlug = (name: string) => name.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Only these niche fields can be edited. RPM comes in as rpmMin / rpmAvg / rpmMax and is merged with the current RPM. */
export function cleanNicheEdit(b: Body, currentRpm?: { min: number; avg: number; max: number }) {
  const rpm = { min: num(b.rpmMin), avg: num(b.rpmAvg), max: num(b.rpmMax) };
  const anyRpm = rpm.min !== undefined || rpm.avg !== undefined || rpm.max !== undefined;
  return drop({
    name: text(b.name, 120),
    summary: text(b.summary, 1000),
    formatRecommendation: text(b.formatRecommendation, 120),
    saturation: ['Low', 'Medium', 'High'].includes(b.saturation as string) ? b.saturation : undefined,
    demandScore: num(b.demandScore) !== undefined ? Math.min(10, num(b.demandScore)!) : undefined,
    rpm: anyRpm ? { ...(currentRpm ?? { min: 0, avg: 0, max: 0 }), ...drop(rpm) } : undefined,
  });
}

export function newNiche(b: Body) {
  const edit = cleanNicheEdit(b);
  if (!edit.name) return { error: 'Niche name is required' } as const;
  const slug = nicheSlug(edit.name as string);
  if (!slug) return { error: 'Niche name must contain letters or numbers' } as const;
  return {
    slug,
    data: {
      name: edit.name,
      slug,
      channelCount: 0,
      avgViews: 0,
      rpm: edit.rpm ?? { min: 4, avg: 8, max: 14 },
      saturation: edit.saturation ?? 'Medium',
      demandScore: edit.demandScore ?? 7,
      formatRecommendation: edit.formatRecommendation ?? 'Faceless Voiceover',
      topTitleFormulas: [],
      summary: edit.summary ?? `Channels, RPM benchmarks and outlier videos in the ${edit.name} YouTube niche.`,
    },
  } as const;
}

/**
 * The admin's list: every base item (hidden ones too, so they can be restored) with edits applied,
 * plus items added in the admin, each tagged with how it differs from the catalog.
 */
export function adminView<T extends object>(items: T[], overrides: Override[], keyOf: (item: T) => string) {
  const byKey = new Map(overrides.map((o) => [o.key, o]));
  const out: (T & { _status: EditStatus })[] = items.map((item) => {
    const o = byKey.get(keyOf(item));
    byKey.delete(keyOf(item));
    if (!o) return { ...item, _status: null };
    return { ...item, ...o.data, _status: o.hidden ? 'hidden' : 'edited' } as T & { _status: EditStatus };
  });
  const added = [...byKey.values()].filter((o) => Object.keys(o.data).length);
  return [...added.map((o) => ({ ...(o.data as T), _status: (o.hidden ? 'hidden' : 'new') as EditStatus })), ...out];
}
