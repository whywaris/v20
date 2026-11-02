'use client';

import React from 'react';
import { Lock, TrendingUp } from 'lucide-react';

export default function GatedStats() {
  const handleUnlock = () => {
    alert('Supabase Google OAuth modal: Sign in to unlock full revenue analytics, daily velocity charts, and monetization funnels.');
  };

  return (
    <div className="relative rounded-2xl overflow-hidden glass p-6 sm:p-8 border border-[var(--brand-accent)]/30 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-[var(--brand-mark)]" />
          <h2 className="text-lg font-bold text-[var(--text-ink)]">
            Daily Growth Charts &amp; AdSense Revenue Analytics
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
          <Lock className="size-3" /> Pro Member Area
        </span>
      </div>

      {/* Blurred Content Placeholder */}
      <div className="filter blur-sm select-none pointer-events-none opacity-40 grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
        <div className="h-28 bg-[var(--bg-surface-2)] rounded-xl"></div>
      </div>

      {/* Center Overlay Card */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
        <div className="size-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center mb-3 shadow-lg">
          <Lock className="size-5" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Unlock Full Revenue &amp; Daily Velocity Stats
        </h3>
        <p className="text-xs text-white/80 max-w-md mb-4">
          Connect via Google to unlock 30-day growth tables, estimated monthly AdSense revenue, and digital offer funnels.
        </p>
        <button
          onClick={handleUnlock}
          className="btn-accent h-10 px-6 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Sign In with Google to Unlock (Free)
        </button>
      </div>
    </div>
  );
}
