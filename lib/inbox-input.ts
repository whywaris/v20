// Validation for the public contact form and "suggest a channel" form. Pure, so it can be tested.

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

/** Only YouTube channel links are accepted, normalised to https. */
export function validateSubmission(b: Body): Result<{ channel_url: string; suggested_niche: string | null; email: string | null; note: string | null }> {
  if (isBot(b)) return { ok: false, error: 'Rejected', spam: true };
  let url: URL;
  try {
    url = new URL(str(b.url, 300).replace(/^(?!https?:\/\/)/i, 'https://'));
  } catch {
    return { ok: false, error: 'Please paste a YouTube channel link.' };
  }
  if (!/^(www\.|m\.)?youtube\.com$/i.test(url.hostname) || url.pathname.length < 2) {
    return { ok: false, error: 'Please paste a YouTube channel link (youtube.com/@…).' };
  }
  url.protocol = 'https:';
  const email = str(b.email, 200);
  if (email && !EMAIL.test(email)) return { ok: false, error: 'That email address looks wrong.' };
  return {
    ok: true,
    value: { channel_url: url.toString(), suggested_niche: str(b.niche, 100) || null, email: email || null, note: str(b.note, 1000) || null },
  };
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
