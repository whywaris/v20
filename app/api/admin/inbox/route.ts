import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';

const STATUSES = ['new', 'read', 'archived'];

// PATCH { id, status } on a contact form message.
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, status } = await request.json().catch(() => ({}));
  if (!Number.isInteger(id) || !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { error } = await createAdminClient().from('messages').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/admin', 'layout'); // unread badge in the sidebar
  return NextResponse.json({ success: true });
}
