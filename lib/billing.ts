import { createHmac, timingSafeEqual } from "node:crypto";

export const PRICES = { monthly: { amount: 9, label: "$9/month" }, yearly: { amount: 79, label: "$79/year" } } as const;

// Lemon Squeezy signs the raw body with HMAC-SHA256 (hex) in the X-Signature header.
export function verifySignature(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Subscription statuses that keep Pro on. "cancelled" stays Pro until ends_at, when LS sends "expired".
export function planFor(status: string): "pro" | "free" {
  return ["active", "on_trial", "past_due", "cancelled"].includes(status) ? "pro" : "free";
}

// Hosted checkout link carrying our user id, which comes back in the webhook's meta.custom_data.
export function checkoutUrl(base: string, userId: string, email?: string): string {
  const url = new URL(base);
  url.searchParams.set("checkout[custom][user_id]", userId);
  if (email) url.searchParams.set("checkout[email]", email);
  return url.toString();
}
