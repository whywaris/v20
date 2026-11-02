import fs from 'node:fs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isValidSessionToken } from './admin-token';

export { adminConfigured, createSessionToken, passwordMatches } from './admin-token';
export const ADMIN_COOKIE = 'yt_admin';

export async function isAdmin(): Promise<boolean> {
  return isValidSessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
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
