import { createAdminClient } from '@/lib/supabase/admin';

// Read-only queries for admin pages (service role). Call only after the admin check. Each one fails soft
// (returns empty / 0 plus a note) so a missing table or env var shows a hint instead of crashing the admin.

export type Count = { value: number; missing?: string };

async function count(table: string, filter?: [string, string]): Promise<Count> {
  try {
    // Not `head: true`: a HEAD request on a missing table comes back without an error, hiding the setup hint.
    let q = createAdminClient().from(table).select('*', { count: 'exact' }).limit(1);
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n, error } = await q;
    if (error) throw error;
    return { value: n ?? 0 };
  } catch (e) {
    return { value: 0, missing: hint((e as Error).message) };
  }
}

export const unreadMessages = () => count('messages', ['status', 'new']);
export const pendingSubmissions = () => count('submissions', ['status', 'pending']);
export const overrideCount = () => count('content_overrides');
export const postCount = (status: 'published' | 'draft') => count('posts', ['status', status]);

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  lastSignIn: string | null;
  banned: boolean;
};

/** Everyone who has signed in, newest first, with their role from profiles. */
export async function listUsers(): Promise<{ users: AdminUser[]; missing?: string }> {
  try {
    const admin = createAdminClient();
    const users: AdminUser[] = [];
    // ponytail: pages through auth users 1000 at a time; fine for thousands of sign-ups.
    for (let page = 1; page < 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      for (const u of data.users) {
        users.push({
          id: u.id,
          email: u.email ?? '',
          name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || '',
          avatar: (u.user_metadata?.avatar_url as string) || null,
          role: 'user',
          createdAt: u.created_at,
          lastSignIn: u.last_sign_in_at ?? null,
          banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
        });
      }
      if (data.users.length < 1000) break;
    }
    const { data: profiles } = await admin.from('profiles').select('id, role');
    const roles = new Map((profiles ?? []).map((p) => [p.id as string, p.role as string]));
    for (const u of users) u.role = roles.get(u.id) ?? 'user';
    users.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return { users };
  } catch (e) {
    return { users: [], missing: hint((e as Error).message) };
  }
}

/** Users who signed up in the last `days` days. */
export const signedUpWithin = (users: AdminUser[], days: number) => {
  const since = Date.now() - days * 86_400_000;
  return users.filter((u) => +new Date(u.createdAt) > since).length;
};

export type Message = { id: number; name: string; email: string; subject: string | null; body: string; status: string; created_at: string };
export type Submission = { id: number; channel_url: string; suggested_niche: string | null; email: string | null; note: string | null; status: string; created_at: string };

export async function latest<T>(table: 'messages' | 'submissions', limit = 100): Promise<{ rows: T[]; missing?: string }> {
  try {
    const { data, error } = await createAdminClient().from(table).select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return { rows: (data ?? []) as T[] };
  } catch (e) {
    return { rows: [], missing: hint((e as Error).message) };
  }
}

function hint(message: string) {
  if (/SUPABASE_SERVICE_ROLE_KEY|service role/i.test(message)) return 'Set SUPABASE_SERVICE_ROLE_KEY in the environment.';
  if (/does not exist|schema cache|Could not find the table/i.test(message)) return 'Run supabase/migrations/0006_admin.sql in Supabase.';
  return message;
}
