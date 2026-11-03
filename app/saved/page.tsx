import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Bookmark } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { getUser } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Saved · YT Niches', robots: { index: false } };

export default async function SavedPage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
      <div className="glass rounded-3xl p-10 sm:p-14 border border-[var(--border-line)] max-w-2xl mx-auto">
        <div className="size-16 rounded-2xl bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--brand-accent)]/20">
          <Bookmark className="size-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)] mb-3">
          Your Saved Swipe File &amp; Channels
        </h1>

        {user ? (
          <p className="text-[14.5px] text-[var(--text-muted)] leading-relaxed mb-8 max-w-md mx-auto">
            You&apos;re signed in as <strong className="text-[var(--text-ink)]">{user.email}</strong>.
            Bookmark channels and viral videos across the directory to build your personalized research swipe file.
          </p>
        ) : (
          <>
            <p className="text-[14.5px] text-[var(--text-muted)] leading-relaxed mb-8 max-w-md mx-auto">
              Sign in with your Google account (free) to bookmark channels and unlock deep member insights.
            </p>
            <SignInButton
              label="Sign in with Google (Free)"
              className="btn-accent min-h-11 px-8 rounded-full text-[13.5px] font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            />
          </>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--border-line)]">
          <Link
            href="/"
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--brand-mark)] inline-flex items-center gap-1"
          >
            &larr; Return to Channel Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
