import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AlertCircle, ArrowLeft, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Earnings & RPM Disclaimer · YT Niches',
  description: 'Earnings and Revenue Disclaimer for YT Niches (ytniches.com). Understanding our algorithmic estimations and statistical modeling.',
  alternates: {
    canonical: 'https://ytniches.com/disclaimer',
  },
};

export default function EarningsDisclaimerPage() {
  const lastUpdated = 'October 27, 2026';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] mb-6 transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Home
      </Link>

      {/* Header */}
      <div className="mb-10 border-b border-[var(--border-line)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
          <AlertCircle className="size-3.5" /> Financial &amp; Estimation Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          Earnings &amp; RPM Disclaimer
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Effective Date: {lastUpdated} &bull; Canonical URL: https://ytniches.com/disclaimer
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed text-[var(--text-ink)] space-y-8">
        
        <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5">
          <h2 className="text-base font-bold text-amber-500 mb-2 flex items-center gap-2">
            <AlertCircle className="size-5" /> Crucial Notice Regarding Revenue Figures
          </h2>
          <p className="text-xs text-[var(--text-ink)] leading-normal m-0">
            All revenue figures, earnings estimates, and RPM (Revenue Per Mille) numbers displayed across <strong>YT Niches</strong> (<strong>https://ytniches.com/</strong>) are algorithmically computed approximations intended solely for comparative market research and creative inspiration. They are <strong>NOT guarantees of income</strong> and do not represent internal private earnings statements provided by creators or YouTube.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            1. How Estimates Are Computed
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            Our estimation engine models earnings using:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
            <li><strong>Public Viewership Velocity:</strong> Publicly available 30-day and all-time video view metrics.</li>
            <li><strong>Categorical RPM Benchmarks:</strong> Historical industry benchmarks mapped across 3,100+ categories (e.g., Personal Finance commands higher advertiser CPM than Gaming or Memes).</li>
            <li><strong>Monetization Flags:</strong> Channel monetization indicators, upload frequency, and median video duration (longer videos allowing mid-roll ad placement).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            2. Variables Influencing Actual YouTube Revenue
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            Actual creator income varies significantly based on factors our external models cannot access:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Audience Demographics</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Views from Tier-1 economies (US, UK, Canada, Australia) pay 5x to 15x higher CPM than views from other geographic regions.
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Seasonality &amp; Ad Inventory</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Ad rates spike dramatically during Q4 (holiday shopping) and contract sharply in January (Q1).
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Ad Blocker Usage</h3>
              <p className="text-xs text-[var(--text-muted)]">
                A notable percentage of viewers use ad-blocking extensions, lowering monetized playback rates.
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Channel-Specific Contracts</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Sponsorships, affiliate marketing, digital courses, and brand integrations are not accounted for in standard AdSense estimates.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            3. No Financial or Business Advice
          </h2>
          <p className="text-[var(--text-muted)]">
            Nothing published on YT Niches constitutes financial, legal, or investment advice. You assume full responsibility for any financial decisions, channel launch investments, or software subscriptions you undertake. Always conduct independent due diligence before committing resources to any YouTube automation project.
          </p>
        </section>

      </div>

    </div>
  );
}
