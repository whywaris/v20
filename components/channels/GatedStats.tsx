'use client';

import React from 'react';
import { Gift, Lock, TrendingUp } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase/client';

// Shown to logged-out visitors. Everything behind it is free: signing in with Google is the only requirement.
export default function GatedStats() {

  return (
    <div className="relative rounded-2xl overflow-hidden glass p-6 sm:p-8 border border-[var(--brand-accent)]/30 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-[var(--brand-mark)]" />
          <h2 className="text-lg font-bold text-[var(--text-ink)]">
            Member Insights &amp; AdSense Earnings Estimates
          </h2>
        </div>
      </div>

      {/* Blurred Content Placeholder */}
      <div className="filter blur-sm select-none pointer-events-none opacity-40 grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
      </div>

      {/* Center Overlay Card */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 mb-3">
          <Gift className="size-3" /> Free Community Access
        </span>
        <div className="size-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center mb-3 shadow-lg">
          <Lock className="size-5" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Free with Google Sign-In
        </h3>
        <p className="text-xs text-white/80 max-w-md mb-4">
          Unlock estimated monthly AdSense earnings, upload rhythm, what the channel sells, and viral title patterns
          completely free. No credit card, no paid plans.
        </p>
        <button
          onClick={signInWithGoogle}
          className="btn-accent min-h-11 px-6 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Sign in with Google to Unlock (100% Free)
        </button>
      </div>
    </div>
  );
}
