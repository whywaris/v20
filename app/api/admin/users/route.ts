import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminUser } from '@/lib/admin';
import { listUsers } from '@/lib/admin-queries';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await listUsers());
}

// PATCH { id, role?: 'user' | 'admin', blocked?: boolean }. Admins can't change or block themselves.
export async function PATCH(request: Request) {
  const { user, denied } = await requireAdminUser();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: "You can't change your own account" }, { status: 400 });

  try {
    const admin = createAdminClient();
    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) return NextResponse.json({ error: 'Role must be user or admin' }, { status: 400 });
      // upsert: older sign-ups may have no profiles row yet
      const { error } = await admin.from('profiles').upsert({ id, role: body.role }, { onConflict: 'id' });
      if (error) throw error;
    }
    if (typeof body.blocked === 'boolean') {
      // Supabase bans by duration; ~100 years is "until unblocked". Blocked users can't sign in or refresh sessions.
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: body.blocked ? '876000h' : 'none' });
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
