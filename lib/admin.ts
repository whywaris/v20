import fs from 'node:fs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isValidSessionToken, isWhitelistedGoogleAdmin } from './admin-token';
import { createClient, getUser } from './supabase/server';

export { adminConfigured, createSessionToken, passwordMatches } from './admin-token';
export const ADMIN_COOKIE = 'yt_admin';

// Admin = the ADMIN_PASSWORD session cookie, OR a signed-in Google account that is either listed in
// ADMIN_EMAILS (Google-verified email only) or has profiles.role = 'admin'.
export async function isAdmin(): Promise<boolean> {
  if (isValidSessionToken((await cookies()).get(ADMIN_COOKIE)?.value)) return true;
  const user = await getUser();
  if (!user) return false;
  if (isWhitelistedGoogleAdmin(user)) return true;

  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); // RLS: own row only
  return data?.role === 'admin';
}

// Call first in every admin route handler: `const denied = await requireAdmin(); if (denied) return denied;`
export async function requireAdmin(): Promise<NextResponse | null> {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'Not authorized' }, { status: 401 });
}

// Vercel's file system is read-only, so admin edits only persist when running locally.
export function saveJson(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EROFS' || process.env.VERCEL) {
      throw new Error('Edits can only be saved when running locally (npm run dev). Commit the updated data/ files, then push to deploy.');
    }
    throw e;
  }
}
