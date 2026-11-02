import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// The admin password lives only in the ADMIN_PASSWORD env var (server side). A session is "<expiry>.<hmac>",
// signed with a key derived from that password, so changing it logs everyone out. No password = admin locked.
const SESSION_DAYS = 7;

const secret = () => process.env.ADMIN_PASSWORD?.trim() || '';
const sign = (expiry: string) => createHmac('sha256', `admin-session:${secret()}`).update(expiry).digest('hex');
const sameText = (a: string, b: string) =>
  timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

export const adminConfigured = () => !!secret();

export function passwordMatches(input: unknown): boolean {
  return !!secret() && typeof input === 'string' && sameText(input, secret());
}

export function createSessionToken(now = Date.now()) {
  const expiry = String(now + SESSION_DAYS * 86_400_000);
  return { value: `${expiry}.${sign(expiry)}`, maxAge: SESSION_DAYS * 86_400 };
}

export function isValidSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!secret() || !token) return false;
  const [expiry, sig] = token.split('.');
  if (!expiry || !sig || Number(expiry) < now) return false;
  return sameText(sig, sign(expiry));
}
