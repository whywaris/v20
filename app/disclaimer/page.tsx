import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Earnings & RPM Disclaimer · YT Niches',
  description: 'Earnings and Revenue Disclaimer for YT Niches (ytniches.com). How to read the RPM, earnings and growth figures in our articles.',
  alternates: {
    canonical: 'https://ytniches.com/disclaimer',
  },
};

export default function EarningsDisclaimerPage() {
  const lastUpdated = 'November 16, 2026';

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
            All revenue figures, earnings estimates, and RPM (Revenue Per Mille) numbers in articles on <strong>YT Niches</strong> (<strong>https://ytniches.com/</strong>) are approximations based on public data and creator-reported benchmarks, intended for education and comparison. They are <strong>NOT guarantees of income</strong> and do not represent internal private earnings statements provided by creators or YouTube.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            1. Where Our Figures Come From
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            Earnings and RPM figures in our articles are built from:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
            <li><strong>Public view counts:</strong> Publicly visible video and channel view numbers at the time of writing.</li>
            <li><strong>RPM benchmarks by topic:</strong> Creator-reported and industry benchmarks (e.g., Personal Finance commands higher advertiser CPM than Gaming or Memes).</li>
            <li><strong>Channel signals:</strong> Whether a channel appears monetized, how often it uploads, and typical video length (longer videos allow mid-roll ads).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            2. Variables Influencing Actual YouTube Revenue
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            Actual creator income varies significantly based on factors we cannot see from the outside:
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

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            4. Advertising
          </h2>
          <p className="text-[var(--text-muted)]">
            YT Niches shows ads served by Google AdSense. Ads are chosen by Google and are clearly separated from our articles. Advertisers have no say in what we write, and ads do not influence our content or recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            5. Affiliate Links
          </h2>
          <p className="text-[var(--text-muted)]">
            We currently don&apos;t use affiliate links. If that changes, affected pages will say so at the top.
          </p>
        </section>

      </div>

    </div>
  );
}
