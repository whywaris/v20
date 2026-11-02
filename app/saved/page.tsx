'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
      <div className="glass rounded-3xl p-10 sm:p-14 border border-[var(--border-line)] max-w-2xl mx-auto">
        <div className="size-16 rounded-2xl bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--brand-accent)]/20">
          <Bookmark className="size-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)] mb-3">
          Your Saved Swipe File &amp; Channels
        </h1>

        <p className="text-[14.5px] text-[var(--text-muted)] leading-relaxed mb-8 max-w-md mx-auto">
          Sign in with your Google account to bookmark viral videos, save high-performing channels, and organize your research into custom folders.
        </p>

        <button
          onClick={() => alert('Supabase Google OAuth popup will trigger here once keys are added to .env.local')}
          className="btn-accent h-11 px-8 rounded-full text-[13.5px] font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <LogIn className="size-4" />
          Sign In with Google to View Saved Items
        </button>

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
