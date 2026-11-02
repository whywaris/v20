import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "./safe-next.ts";

test("safeNext keeps relative paths and blocks other domains", () => {
  assert.equal(safeNext("/channel/abc"), "/channel/abc");
  assert.equal(safeNext("//evil.com"), "/");
  assert.equal(safeNext("/\\evil.com"), "/");
  assert.equal(safeNext("https://evil.com"), "/");
  assert.equal(safeNext(null), "/");
});
