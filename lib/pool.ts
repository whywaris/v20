// Run fn over items with at most `limit` in flight. Stops starting new items after `deadline` (ms timestamp);
// those come back as { skipped: true } so callers can pick them up on the next run.
export type PoolResult<R> = { ok: true; value: R } | { ok: false; error: unknown } | { skipped: true };

export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>, deadline = Infinity): Promise<PoolResult<R>[]> {
  const results: PoolResult<R>[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      if (Date.now() > deadline) { results[i] = { skipped: true }; continue; }
      try { results[i] = { ok: true, value: await fn(items[i]) }; }
      catch (error) { results[i] = { ok: false, error }; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
