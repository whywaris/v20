import { test } from "node:test";
import assert from "node:assert/strict";
import { chunk, mapPool } from "./pool.ts";

test("mapPool keeps order, caps concurrency, isolates errors", async () => {
  let inFlight = 0, peak = 0;
  const r = await mapPool([1, 2, 3, 4, 5, 6], 2, async (n) => {
    inFlight++; peak = Math.max(peak, inFlight);
    await new Promise((res) => setTimeout(res, 5));
    inFlight--;
    if (n === 3) throw new Error("bad");
    return n * 10;
  });
  assert.equal(peak, 2);
  assert.deepEqual(r.map((x) => ("ok" in x && x.ok ? x.value : "ok" in x ? "err" : "skip")), [10, 20, "err", 40, 50, 60]);
});

test("mapPool skips items after the deadline", async () => {
  const r = await mapPool([1, 2, 3], 1, async (n) => n, Date.now() - 1);
  assert.deepEqual(r, [{ skipped: true }, { skipped: true }, { skipped: true }]);
});

test("chunk", () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 2), []);
});
