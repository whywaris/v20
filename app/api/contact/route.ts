import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { rateLimited, validateMessage } from '@/lib/inbox-input';
import { createAdminClient } from '@/lib/supabase/admin';

// Public contact form -> messages table (read in /admin/inbox).
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });

  const check = validateMessage(await request.json().catch(() => ({})));
  if (!check.ok) {
    // Pretend success to bots so they don't retry.
    return check.spam ? NextResponse.json({ success: true }) : NextResponse.json({ error: check.error }, { status: 400 });
  }
  try {
    const { error } = await createAdminClient().from('messages').insert(check.value);
    if (error) throw error;
  } catch (e) {
    console.error('contact form:', (e as Error).message);
    return NextResponse.json({ error: 'Could not send right now.' }, { status: 503 });
  }
  revalidatePath('/admin', 'layout');
  return NextResponse.json({ success: true });
}
