import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, collectLinks, extractUrls, pickLanding } from "./links.ts";

test("classify known platforms and own sites", () => {
  assert.deepEqual(classify("https://eliasyoder.gumroad.com/l/manual"), { domain: "eliasyoder.gumroad.com", kind: "store", platform: "Gumroad" });
  assert.equal(classify("https://www.instagram.com/x")?.kind, "social");
  assert.equal(classify("https://amzn.to/abc")?.kind, "affiliate");
  assert.deepEqual(classify("https://eliasyoder.com/"), { domain: "eliasyoder.com", kind: "site", platform: null });
  assert.equal(classify("not a url"), null);
});

test("extractUrls trims trailing punctuation", () => {
  assert.deepEqual(extractUrls("Get it: https://a.com/x. Also (https://b.com/y)!"), ["https://a.com/x", "https://b.com/y"]);
});

test("collectLinks counts descriptions and pickLanding prefers stores", () => {
  const links = collectLinks("IG https://instagram.com/me", [
    "Save $6,000 https://eliasyoder.com\nhttps://eliasyoder.com again",
    "https://eliasyoder.com https://amzn.to/1",
    "https://shop.gumroad.com/l/x",
  ]);
  const site = links.find((l) => l.domain === "eliasyoder.com");
  assert.equal(site?.count, 2); // once per description, not per mention
  assert.equal(links.find((l) => l.domain === "instagram.com")?.source, "about");
  assert.equal(pickLanding(links)?.platform, "Gumroad");
  assert.equal(pickLanding(links.filter((l) => l.kind !== "store"))?.domain, "eliasyoder.com");
  assert.equal(pickLanding([]), null);
});
