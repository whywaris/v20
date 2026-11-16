// Validation for the public contact form. Pure, so it can be tested.

type Body = Record<string, unknown>;
type Result<T> = { ok: true; value: T } | { ok: false; error: string; spam?: boolean };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Bots fill every field; people never see the hidden "website" field. */
const isBot = (b: Body) => typeof b.website === 'string' && b.website.trim() !== '';

export function validateMessage(b: Body): Result<{ name: string; email: string; subject: string | null; body: string }> {
  if (isBot(b)) return { ok: false, error: 'Rejected', spam: true };
  const name = str(b.name, 120);
  const email = str(b.email, 200);
  const subject = str(b.subject, 200) || null;
  const body = str(b.message, 5000);
  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (body.length < 5) return { ok: false, error: 'Please write a message.' };
  return { ok: true, value: { name, email, subject, body } };
}

/**
 * Small per-IP limit for public forms. ponytail: in-memory per server instance, so it only slows bursts;
 * move to a database or KV counter if spam gets through.
 */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, max = 5, windowMs = 10 * 60_000, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}
