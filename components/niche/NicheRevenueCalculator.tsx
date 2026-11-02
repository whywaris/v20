'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Sparkles, Calculator } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface Props {
  nicheName: string;
  rpm: {
    min: number;
    avg: number;
    max: number;
  };
}

export default function NicheRevenueCalculator({ nicheName, rpm }: Props) {
  const [monthlyViews, setMonthlyViews] = useState<number>(100000);

  const lowMonthly = Math.round((monthlyViews / 1000) * rpm.min);
  const avgMonthly = Math.round((monthlyViews / 1000) * rpm.avg);
  const maxMonthly = Math.round((monthlyViews / 1000) * rpm.max);
  const avgAnnual = avgMonthly * 12;

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--brand-accent)]/30 relative overflow-hidden my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--border-line)] mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
            <Calculator className="size-3" /> Live Profitability Simulator
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-ink)]">
            {nicheName} AdSense Revenue Calculator
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Simulate your estimated earnings based on real benchmark RPM of <strong>${rpm.avg.toFixed(2)}</strong> per 1,000 views.
          </p>
        </div>

        <div className="text-right sm:border-l sm:border-[var(--border-line)] sm:pl-6">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Estimated Annualized</div>
          <div className="text-2xl sm:text-3xl font-extrabold num-mono text-emerald-500">
            {formatCurrency(avgAnnual)}
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-[var(--text-ink)]">Target Monthly Views:</span>
          <span className="font-bold text-lg num-mono text-[var(--brand-mark)]">
            {formatNumber(monthlyViews)} views/month
          </span>
        </div>
        <input
          type="range"
          min={10000}
          max={2000000}
          step={10000}
          value={monthlyViews}
          onChange={(e) => setMonthlyViews(Number(e.target.value))}
          className="w-full h-2.5 bg-[var(--bg-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-mark)]"
        />
        <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono mt-1.5">
          <span>10K views</span>
          <span>500K views</span>
          <span>1M views</span>
          <span>2M views</span>
        </div>
      </div>

      {/* 3-Tier Earnings Output */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Conservative */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-2)]/70 border border-[var(--border-line)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Conservative (${rpm.min.toFixed(2)} RPM)
          </div>
          <div className="text-xl sm:text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
            {formatCurrency(lowMonthly)}
            <span className="text-xs text-[var(--text-muted)] font-normal"> /mo</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Lower CPM regions or high ad-block rates.
          </p>
        </div>

        {/* Expected Benchmark */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="size-3" /> Average Benchmark (${rpm.avg.toFixed(2)} RPM)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold num-mono text-emerald-500 mt-1">
            {formatCurrency(avgMonthly)}
            <span className="text-xs font-normal"> /mo</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Standard mix of global views with mid-rolls.
          </p>
        </div>

        {/* Optimized Tier-1 */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-2)]/70 border border-[var(--border-line)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Optimized US/UK (${rpm.max.toFixed(2)} RPM)
          </div>
          <div className="text-xl sm:text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
            {formatCurrency(maxMonthly)}
            <span className="text-xs text-[var(--text-muted)] font-normal"> /mo</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Tier-1 audiences during peak Q4 ad inventory.
          </p>
        </div>
      </div>
    </div>
  );
}
