'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface HeroPill {
  label: string;
  value: string;
}

interface HeroBannerProps {
  search: string;
  onSearch: (q: string) => void;
  pills: HeroPill[];
  activePill: (value: string) => boolean;
  onPill: (value: string) => void;
  totalChannelsCount: number;
  totalNichesCount: number;
  totalVideosCount: number;
}

export const scrollToDirectory = () => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function HeroBanner({
  search,
  onSearch,
  pills,
  activePill,
  onPill,
  totalChannelsCount,
  totalNichesCount,
  totalVideosCount,
}: HeroBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, unless the user is already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== '/' || t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const kpis = [
    { value: `${totalChannelsCount.toLocaleString()}+`, label: 'Creator Channels (≤ 250k Subs)' },
    { value: `${totalNichesCount.toLocaleString()}+`, label: 'Profitable Niches' },
    { value: `${totalVideosCount.toLocaleString()}+`, label: 'Viral Outliers' },
    { value: '100%', label: 'Free Access (No Paywalls)' },
  ];

  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl border border-[var(--border-line)] bg-[var(--bg-surface)] px-5 py-12 sm:px-10 sm:py-16">
      {/* Soft brand glow behind the headline */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[var(--brand-accent)]/15 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-line)] bg-[var(--bg-surface-2)] px-3 py-1 text-[12px] font-semibold text-[var(--text-ink)]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          🔥 2026 YouTube Arbitrage Database
        </span>

        <h1 className="mb-4 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-[var(--text-ink)] sm:text-5xl md:text-[3.4rem]">
          Find High-RPM YouTube Niches Before They Get Crowded{' '}
          <span className="bg-gradient-to-r from-[var(--brand-accent)] to-amber-400 bg-clip-text text-transparent">(Under 250k Subs)</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-[15.5px] leading-relaxed text-[var(--text-muted)]">
          {totalChannelsCount.toLocaleString()} creator-friendly channels, all capped at 250k subscribers, across{' '}
          {totalNichesCount.toLocaleString()} niches, plus {totalVideosCount.toLocaleString()} viral outlier videos to learn from.
        </p>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            scrollToDirectory();
          }}
          className="glass mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border-[var(--border-line-strong)] p-1.5 shadow-xl shadow-black/5 focus-within:border-[var(--brand-mark)]"
        >
          <Search className="ml-3 size-5 shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search channels, niches or topics…"
            aria-label="Search channels"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {search ? (
            <button type="button" onClick={() => onSearch('')} aria-label="Clear search" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-ink)]">
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded-md border border-[var(--border-line)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)] sm:block" title="Press / to search">
              /
            </kbd>
          )}
          <button type="submit" className="btn-accent h-11 shrink-0 rounded-xl px-5 text-[14px]">
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pills.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                onPill(p.value);
                scrollToDirectory();
              }}
              className={`min-h-9 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors ${
                activePill(p.value)
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                  : 'border-[var(--border-line)] bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:border-[var(--brand-accent)]/50 hover:text-[var(--text-ink)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 border-t border-[var(--border-line)] pt-8 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="text-center">
            <div className="num-mono text-2xl font-bold text-[var(--text-ink)] sm:text-3xl">{k.value}</div>
            <div className="mt-1 text-[12px] font-medium text-[var(--text-muted)]">{k.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
