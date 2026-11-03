'use client';

import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { scrollToDirectory } from '@/components/home/HeroBanner';

export interface RpmPreset {
  name: string;
  category: string;
  rpm: number;
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function HomeRevenueSimulator({ presets, onPick }: { presets: RpmPreset[]; onPick: (category: string) => void }) {
  const [views, setViews] = useState(100_000);
  const [picked, setPicked] = useState(0);
  if (!presets.length) return null;
  const preset = presets[picked] ?? presets[0];
  const monthly = (views / 1000) * preset.rpm;

  return (
    <section className="mb-14 rounded-3xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:p-8" aria-labelledby="sim-title">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[var(--brand-mark)]">
            <Calculator className="size-3.5" /> Revenue Simulator
          </div>
          <h2 id="sim-title" className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">
            What could a niche pay you?
          </h2>
          <p className="mt-2 text-[14px] text-[var(--text-muted)]">Pick a niche and drag the slider to estimate monthly AdSense revenue.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setPicked(i)}
                aria-pressed={i === picked}
                className={`min-h-9 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors ${
                  i === picked
                    ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                    : 'border-[var(--border-line)] bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                {p.name} · <span className="num-mono">${p.rpm}</span>
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="flex items-baseline justify-between text-[13px] font-semibold text-[var(--text-ink)]">
              Monthly views <span className="num-mono">{views.toLocaleString()}</span>
            </span>
            <input
              type="range"
              min={10_000}
              max={2_000_000}
              step={10_000}
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--brand-accent)]"
            />
            <span className="flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>10K</span>
              <span>2M</span>
            </span>
          </label>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface-2)] p-6 text-center">
          <div className="text-[13px] font-semibold text-[var(--text-muted)]">Estimated earnings</div>
          <div className="num-mono mt-2 text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-5xl" aria-live="polite">
            +{usd(monthly)}
            <span className="text-lg font-bold text-[var(--text-muted)]"> / month</span>
          </div>
          <p className="mt-2 text-[12px] text-[var(--text-muted)]">
            {preset.name} benchmark RPM ${preset.rpm} (niche average). Real RPM varies by audience country and season.
          </p>
          <button
            type="button"
            onClick={() => {
              onPick(preset.category);
              scrollToDirectory();
            }}
            className="btn-accent mt-6 inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px]"
          >
            Find Low-Competition Niches Like This <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
