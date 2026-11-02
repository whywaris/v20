import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service · YT Niches',
  description: 'Terms of Service for YT Niches (ytniches.com). Understand your rights and responsibilities when using our platform.',
  alternates: {
    canonical: 'https://ytniches.com/terms',
  },
};

export default function TermsOfServicePage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3">
          <FileText className="size-3.5" /> Terms &amp; Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Effective Date: {lastUpdated} &bull; Canonical URL: https://ytniches.com/terms
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed text-[var(--text-ink)] space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            1. Agreement to Terms
          </h2>
          <p className="text-[var(--text-muted)]">
            By visiting, accessing, or using <strong>YT Niches</strong> (<strong>https://ytniches.com/</strong>), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue your use of our platform immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            2. Intellectual Property &amp; YouTube Attribution
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            YT Niches is an independent market research and analysis directory. All YouTube channel names, logos, video thumbnails, and public statistics displayed on this platform remain the intellectual property and copyright of their respective owners and YouTube LLC / Google LLC.
          </p>
          <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
            <p className="text-xs text-[var(--text-muted)] m-0">
              <strong>Notice of Non-Affiliation:</strong> YT Niches is not sponsored, endorsed, affiliated, or officially associated with YouTube, Google LLC, or Alphabet Inc.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            3. Permitted &amp; Prohibited Use
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            You are granted a revocable, non-exclusive license to inspect niche data, review video swipe files, and conduct creative research. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
            <li>Deploy automated scrapers, bots, or distributed crawlers that overwhelm our servers or disrupt service availability.</li>
            <li>Resell, sublicense, or distribute raw bulk exports of our unified database without explicit written consent.</li>
            <li>Circumvent or tamper with authentication locks or security features.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            4. User Accounts &amp; Authentication
          </h2>
          <p className="text-[var(--text-muted)]">
            When signing in using Google OAuth, you are responsible for maintaining the security of your account credentials. We reserve the right to suspend or terminate accounts that engage in fraudulent activity, abusive behavior, or violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            5. Limitation of Liability
          </h2>
          <p className="text-[var(--text-muted)]">
            To the maximum extent permitted by applicable law, YT Niches, its owners, and operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your reliance on any estimates, revenue figures, or information provided on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">
            6. Changes to Terms
          </h2>
          <p className="text-[var(--text-muted)]">
            We reserve the right to amend these Terms at our discretion. Notice of updates will be posted directly to this URL with a revised effective date. Continued use of YT Niches after changes constitute acceptance of the updated terms.
          </p>
        </section>

      </div>

    </div>
  );
}
