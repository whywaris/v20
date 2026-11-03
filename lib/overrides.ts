// Admin edits stored in Supabase (content_overrides) layered over the JSON catalog. Pure, so it can be tested.

export type OverrideKind = 'channel' | 'niche';
export type Override = { kind: OverrideKind; key: string; data: Record<string, unknown>; hidden: boolean; updated_at?: string };

/**
 * Apply overrides to a list: `data` is merged into the item with the same key, `hidden` removes it, and an
 * override with no matching item is added as a new item (admin "Add channel"). Base order is kept; new items go last.
 */
export function applyOverrides<T extends object>(items: T[], overrides: Override[], keyOf: (item: T) => string): T[] {
  if (!overrides.length) return items;
  const byKey = new Map(overrides.map((o) => [o.key, o]));
  const out: T[] = [];
  for (const item of items) {
    const o = byKey.get(keyOf(item));
    if (!o) out.push(item);
    else if (!o.hidden) out.push({ ...item, ...o.data } as T);
    byKey.delete(keyOf(item));
  }
  for (const o of byKey.values()) if (!o.hidden && Object.keys(o.data).length) out.push(o.data as T);
  return out;
}
