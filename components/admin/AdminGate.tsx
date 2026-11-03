'use client';

import { LogIn, ShieldAlert } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase/client';

/** Shown instead of the admin when nobody is signed in, or the signed-in account isn't an admin. */
export default function AdminGate({ email }: { email: string | null }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-8 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-accent)]/15 text-[var(--brand-mark)]">
          <ShieldAlert className="size-6" />
        </span>
        {email ? (
          <>
            <h1 className="text-xl font-bold text-[var(--text-ink)]">Not an admin account</h1>
            <p className="mt-2 text-[14px] text-[var(--text-muted)]">
              <strong className="text-[var(--text-ink)]">{email}</strong> doesn&apos;t have admin access.
            </p>
            <form action="/auth/signout?next=/admin" method="post" className="mt-6">
              <button type="submit" className="h-11 w-full rounded-xl border border-[var(--border-line-strong)] text-[14px] font-semibold text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]">
                Sign in with another account
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[var(--text-ink)]">YT Niches Admin</h1>
            <p className="mt-2 text-[14px] text-[var(--text-muted)]">Sign in with your admin Google account.</p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="btn-accent mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px]"
            >
              <LogIn className="size-4" /> Sign in with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
