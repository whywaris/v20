import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';

const STATUSES = {
  messages: ['new', 'read', 'archived'],
  submissions: ['pending', 'approved', 'rejected'],
} as const;

// PATCH { table: 'messages' | 'submissions', id, status }
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { table, id, status } = await request.json().catch(() => ({}));
  if (!(table in STATUSES) || !Number.isInteger(id) || !(STATUSES[table as keyof typeof STATUSES] as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { error } = await createAdminClient().from(table).update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/admin', 'layout'); // unread badge in the sidebar
  return NextResponse.json({ success: true });
}
