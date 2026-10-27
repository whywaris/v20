import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkoutUrl, planFor, verifySignature } from "./billing.ts";

test("verifySignature accepts only the right HMAC", () => {
  const body = '{"meta":{"event_name":"subscription_created"}}';
  const sig = createHmac("sha256", "s3cret").update(body).digest("hex");
  assert.equal(verifySignature(body, sig, "s3cret"), true);
  assert.equal(verifySignature(body + " ", sig, "s3cret"), false);
  assert.equal(verifySignature(body, sig, "other"), false);
  assert.equal(verifySignature(body, "short", "s3cret"), false);
  assert.equal(verifySignature(body, null, "s3cret"), false);
  assert.equal(verifySignature(body, sig, undefined), false);
});

test("planFor and checkoutUrl", () => {
  assert.equal(planFor("active"), "pro");
  assert.equal(planFor("cancelled"), "pro");
  assert.equal(planFor("expired"), "free");
  assert.equal(planFor("unpaid"), "free");
  const url = new URL(checkoutUrl("https://store.lemonsqueezy.com/buy/abc", "u-1", "a@b.co"));
  assert.equal(url.searchParams.get("checkout[custom][user_id]"), "u-1");
  assert.equal(url.searchParams.get("checkout[email]"), "a@b.co");
});
