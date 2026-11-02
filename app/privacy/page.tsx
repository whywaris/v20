import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Shield, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy · YT Niches',
  description: 'Privacy Policy for YT Niches (ytniches.com). Learn how we collect, protect, and handle your data and Google authentication.',
  alternates: {
    canonical: 'https://ytniches.com/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
          <Shield className="size-3.5" /> Legal &amp; Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Effective Date: {lastUpdated} &bull; Canonical URL: https://ytniches.com/privacy
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed text-[var(--text-ink)] space-y-8">
        
        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            1. Introduction
          </h2>
          <p className="text-[var(--text-muted)]">
            Welcome to <strong>YT Niches</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible via <strong>https://ytniches.com/</strong>. We respect your personal privacy and are committed to protecting any information you share with us. This Privacy Policy details our practices concerning data collection, use, and disclosure when you browse our directory, utilize our swipe file, or sign in via Google OAuth.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            2. Information We Collect
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            We collect minimal information necessary to deliver our analytics and personalized features:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
            <li>
              <strong>Google Account Information (OAuth):</strong> When you choose to authenticate via Google to unlock deep growth metrics or bookmark items, we receive your email address, full name, and avatar picture provided by Google. We never request, access, or store your Google password.
            </li>
            <li>
              <strong>Saved Items &amp; Research:</strong> Channels, swipe videos, and custom collections you save while authenticated are stored securely in our database (powered by Supabase).
            </li>
            <li>
              <strong>Usage Analytics &amp; Cookies:</strong> Anonymous device information, browser type, referring URLs, and interaction timestamps to optimize platform speed and user experience.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
            <li>To provide, maintain, and personalize your access to full YouTube channel stats and daily growth history.</li>
            <li>To persist your saved folders, bookmarked swipe-file videos, and custom watchlists.</li>
            <li>To send optional weekly niche intelligence reports if you explicitly opted into our newsletter (you can unsubscribe anytime).</li>
            <li>To detect, prevent, and mitigate security threats, abuse, or unauthorized automated scraping.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            4. Third-Party Service Providers
          </h2>
          <p className="text-[var(--text-muted)] mb-3">
            We partner with reliable third-party cloud infrastructure to operate YT Niches securely:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Supabase (PostgreSQL &amp; Auth)</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Secure cloud database with Row Level Security (RLS) and encrypted session token handling.
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-[var(--border-line)]">
              <h3 className="font-bold text-sm text-[var(--text-ink)] mb-1">Google OAuth</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Standard identity protocol allowing safe, 1-click authentication without sharing passwords.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            5. Data Protection &amp; Security
          </h2>
          <p className="text-[var(--text-muted)]">
            We implement strict technical and organizational safeguards. All web communication is encrypted using industry-standard TLS/SSL (HTTPS). Sensitive database operations enforce Row Level Security, ensuring your bookmarked collections are accessible only by your verified authenticated ID.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
            6. Your Rights &amp; Contact
          </h2>
          <p className="text-[var(--text-muted)]">
            You hold the right to request deletion of your account and saved collections at any time. For privacy inquiries or data removal requests, please contact our support team at <strong>privacy@ytniches.com</strong>.
          </p>
        </section>

      </div>

    </div>
  );
}
