import { revalidatePath, revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOverrides, OVERRIDES_TAG } from '@/lib/data';
import type { Override, OverrideKind } from '@/lib/overrides';

// Writes admin edits to content_overrides (service role) and refreshes the pages that show them.

const PAGES: Record<OverrideKind, (key: string) => string[]> = {
  channel: (key) => [`/channel/${encodeURIComponent(key)}`, '/channels', '/', '/channels-sitemap.xml'],
  niche: (key) => [`/niche/${encodeURIComponent(key)}`, '/niche', '/', '/niches-sitemap.xml'],
};

function refresh(kind: OverrideKind, key: string) {
  revalidateTag(OVERRIDES_TAG, { expire: 0 });
  for (const p of PAGES[kind](key)) revalidatePath(p);
}

/** Read straight from the database (not the 5-minute cache) so successive edits build on each other. */
async function currentOverride(kind: OverrideKind, key: string): Promise<Override | null> {
  const { data, error } = await createAdminClient().from('content_overrides').select('kind, key, data, hidden').eq('kind', kind).eq('key', key).maybeSingle();
  if (error) throw new Error(friendly(error.message));
  return data as Override | null;
}

/** Merge `data` into the item's override and/or set `hidden`. */
export async function saveOverride(kind: OverrideKind, key: string, patch: { data?: Record<string, unknown>; hidden?: boolean }, userId: string) {
  const existing = await currentOverride(kind, key);
  const { error } = await createAdminClient()
    .from('content_overrides')
    .upsert({
      kind,
      key,
      data: { ...(existing?.data ?? {}), ...(patch.data ?? {}) },
      hidden: patch.hidden ?? existing?.hidden ?? false,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    });
  if (error) throw new Error(friendly(error.message));
  refresh(kind, key);
}

/** Forget all edits to an item (an admin-added item disappears). */
export async function resetOverride(kind: OverrideKind, key: string) {
  const { error } = await createAdminClient().from('content_overrides').delete().eq('kind', kind).eq('key', key);
  if (error) throw new Error(friendly(error.message));
  refresh(kind, key);
}

/** Overrides straight from the database, for the admin list (fresh after a save). */
export async function adminOverrides(kind: OverrideKind): Promise<Override[]> {
  try {
    const { data, error } = await createAdminClient().from('content_overrides').select('kind, key, data, hidden, updated_at').eq('kind', kind);
    if (error) throw error;
    return (data ?? []) as Override[];
  } catch {
    return getOverrides(kind);
  }
}

function friendly(message: string) {
  return /content_overrides/.test(message) && /does not exist|schema cache/i.test(message)
    ? 'Run supabase/migrations/0006_admin.sql in Supabase first (content_overrides table is missing).'
    : message;
}
