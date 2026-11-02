import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, createSessionToken, isAdmin, passwordMatches } from '@/lib/admin';

// GET: is the current browser logged in as admin?
export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin(), configured: !!process.env.ADMIN_PASSWORD?.trim() });
}

// POST { password }: log in.
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return NextResponse.json({ error: 'Admin is disabled: set ADMIN_PASSWORD in the environment.' }, { status: 503 });
  }
  const { password } = await request.json().catch(() => ({}));
  if (!passwordMatches(password)) {
    // ponytail: fixed delay slows guessing; add per-IP rate limiting if the URL gets hammered.
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const { value, maxAge } = createSessionToken();
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  });
  return res;
}

// DELETE: log out.
export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
