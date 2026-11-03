import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { isWhitelistedGoogleAdmin } from './admin-token';
import { createClient, getUser } from './supabase/server';

// Admin = a signed-in Google account that is listed in ADMIN_EMAILS (Google-verified email only)
// or has profiles.role = 'admin'. Returns that user, or null.
export async function getAdminUser(): Promise<User | null> {
  const user = await getUser();
  if (!user) return null;
  if (isWhitelistedGoogleAdmin(user)) return user;

  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); // RLS: own row only
  return data?.role === 'admin' ? user : null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

// Call first in every admin route handler: `const denied = await requireAdmin(); if (denied) return denied;`
export async function requireAdmin(): Promise<NextResponse | null> {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'Not authorized' }, { status: 401 });
}

// Same check, when the handler also needs to know who the admin is.
export async function requireAdminUser(): Promise<{ user: User; denied: null } | { user: null; denied: NextResponse }> {
  const user = await getAdminUser();
  return user ? { user, denied: null } : { user: null, denied: NextResponse.json({ error: 'Not authorized' }, { status: 401 }) };
}
