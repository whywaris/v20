import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Channel, Niche, VideoOutlierItem } from '@/types';
import { readData } from '@/lib/sitemap';
import { applyOverrides, type Override, type OverrideKind } from '@/lib/overrides';

// The catalog: JSON files in data/ plus admin edits from Supabase (content_overrides).
// Every page and API that shows channels or niches should read through here so edits appear everywhere.

export const OVERRIDES_TAG = 'overrides';

// Parsed once per server process; the JSON only changes on deploy.
const base = {
  channels: null as Channel[] | null,
  niches: null as Niche[] | null,
  outliers: null as VideoOutlierItem[] | null,
};
/** The catalog as shipped in data/, without admin edits. */
export const baseChannels = () => (base.channels ??= readData<Channel>('unified_channels.json'));
export const baseNiches = () => (base.niches ??= readData<Niche>('unified_niches.json'));

/** All overrides of one kind. Cached for 5 minutes and refreshed at once when an admin saves (revalidateTag). */
export const getOverrides = unstable_cache(
  async (kind: OverrideKind): Promise<Override[]> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    try {
      const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
        .from('content_overrides')
        .select('kind, key, data, hidden, updated_at')
        .eq('kind', kind);
      if (error) throw error;
      return (data ?? []) as Override[];
    } catch (e) {
      // Table missing (migration not run) or Supabase down: show the plain catalog rather than failing the page.
      console.error('content_overrides unavailable:', (e as Error).message);
      return [];
    }
  },
  ['content-overrides'],
  { tags: [OVERRIDES_TAG], revalidate: 300 }
);

export const channelKey = (c: Pick<Channel, 'id'>) => c.id;
export const nicheKey = (n: Pick<Niche, 'slug'>) => n.slug;

export async function getChannels(): Promise<Channel[]> {
  return applyOverrides(baseChannels(), await getOverrides('channel'), channelKey);
}

export async function getNiches(): Promise<Niche[]> {
  return applyOverrides(baseNiches(), await getOverrides('niche'), nicheKey);
}

/** Outliers are not editable; they come straight from the JSON. */
export function getOutliers(): VideoOutlierItem[] {
  return (base.outliers ??= readData<VideoOutlierItem>('unified_outliers.json'));
}

/** The unedited catalog item, for the admin's "Reset to original". */
export const getBaseChannel = (id: string) => baseChannels().find((c) => c.id === id) ?? null;
export const getBaseNiche = (slug: string) => baseNiches().find((n) => n.slug === slug) ?? null;
