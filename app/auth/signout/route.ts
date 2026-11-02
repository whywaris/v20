import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/safe-next';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
