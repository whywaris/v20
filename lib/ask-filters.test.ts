import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanFilters, type AskFilters } from "./ask-filters.ts";

const base: AskFilters = { niches: [], faceless: null, ai_avatar: null, sells_product: null, min_subs: null, max_subs: null, country: null, language: null, sort: "subscribers", keywords: [] };

test("cleanFilters drops unknown niches, bad numbers and unsafe keywords", () => {
  const f = cleanFilters({
    ...base,
    niches: ["history", "made-up", "history"],
    min_subs: -5, max_subs: 100000.7,
    country: "us", language: "English",
    sort: "bogus" as AskFilters["sort"],
    keywords: ["Amish,cooking)", "ok", "título", "a.b%c"],
  }, ["history", "cooking"]);
  assert.deepEqual(f.niches, ["history"]);
  assert.equal(f.min_subs, null);
  assert.equal(f.max_subs, 100000);
  assert.equal(f.country, "US");
  assert.equal(f.language, null);
  assert.equal(f.sort, "subscribers");
  assert.deepEqual(f.keywords, ["amishcooking", "título", "abc"]);
});
