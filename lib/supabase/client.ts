import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Google sign-in, then back to the page the visitor was on.
export async function signInWithGoogle() {
  // If Google isn't enabled in Supabase yet, say so instead of sending the visitor to a raw error page.
  const settings = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  }).then((r) => r.json()).catch(() => null);
  if (settings && !settings.external?.google) {
    alert('Google sign-in is not switched on yet. Please try again soon.');
    return;
  }
  const next = window.location.pathname + window.location.search;
  const { error } = await createClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) alert(`Google sign-in is not available right now: ${error.message}`);
}
