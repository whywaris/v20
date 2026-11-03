import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { rateLimited, validateSubmission } from '@/lib/inbox-input';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/server';

// Public "suggest a channel" form -> submissions table (reviewed in /admin/inbox).
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(`sub:${ip}`)) return NextResponse.json({ error: 'Too many suggestions. Please try again later.' }, { status: 429 });

  const check = validateSubmission(await request.json().catch(() => ({})));
  if (!check.ok) return check.spam ? NextResponse.json({ success: true }) : NextResponse.json({ error: check.error }, { status: 400 });
  try {
    const user = await getUser();
    const { error } = await createAdminClient().from('submissions').insert({ ...check.value, user_id: user?.id ?? null });
    if (error) throw error;
  } catch (e) {
    console.error('submission:', (e as Error).message);
    return NextResponse.json({ error: 'Could not save right now.' }, { status: 503 });
  }
  revalidatePath('/admin', 'layout');
  return NextResponse.json({ success: true });
}
