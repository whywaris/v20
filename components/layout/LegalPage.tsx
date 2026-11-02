import React from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

// Shared shell for About / Contact / Privacy / Cookie pages (same look as Terms and Disclaimer).
export function LegalPage({
  icon: Icon,
  badge,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] mb-6 transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Home
      </Link>

      <div className="mb-10 border-b border-[var(--border-line)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3">
          <Icon className="size-3.5" /> {badge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-2">{subtitle}</p>}
      </div>

      <div className="max-w-none text-[14.5px] leading-relaxed text-[var(--text-ink)] space-y-8">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[var(--text-ink)] mb-3">{title}</h2>
      <div className="space-y-3 text-[var(--text-muted)] [&_a]:text-[var(--brand-mark)] [&_a]:underline [&_strong]:text-[var(--text-ink)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
