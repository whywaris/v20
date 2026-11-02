import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CONTACT_EMAIL, NOT_AFFILIATED, SITE_URL } from '@/lib/site';

type FooterLink = { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'High-RPM Niches',
    links: [
      { label: 'Finance', href: '/niche/finance' },
      { label: 'Investing', href: '/niche/investing' },
      { label: 'Business', href: '/niche/business' },
      { label: 'Tech', href: '/niche/tech' },
      { label: 'Science', href: '/niche/science' },
      { label: 'History', href: '/niche/history' },
      { label: 'True Crime', href: '/niche/crime' },
      { label: 'Real Estate', href: '/niche/real-estate' },
    ],
  },
  {
    title: 'Tools & Features',
    links: [
      { label: 'Channel Directory', href: '/' },
      { label: 'Viral Outliers', href: '/outliers' },
      { label: 'Niche Explorer', href: '/niche' },
      { label: 'Saved Research', href: '/saved' },
      { label: 'Admin', href: '/admin' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Earnings Disclaimer', href: '/disclaimer' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
  {
    title: 'Company & Trust',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Research Methodology', href: '/blog' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-line)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 transition-colors duration-200 mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 mb-12">
          {/* Col 1: Brand & mission */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pr-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-accent)] text-white shadow-sm">
                <Sparkles className="size-4 fill-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-[var(--text-ink)]">
                YT <span className="text-[var(--brand-mark)]">Niches</span>
              </span>
            </Link>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-3">
              A research directory of low-competition YouTube channels, niche RPM estimates and outlier videos, built to
              help creators pick a niche with data instead of guesswork.
            </p>
            <p className="text-[12.5px] text-[var(--text-muted)] mb-3">
              <a href={SITE_URL} className="text-[var(--brand-mark)] hover:underline">ytniches.com</a>
              {' · '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[var(--brand-mark)] hover:underline">{CONTACT_EMAIL}</a>
            </p>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed border-l-2 border-[var(--border-line-strong)] pl-3">
              {NOT_AFFILIATED}
            </p>
          </div>

          {/* Cols 2-5 */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-semibold text-[13.5px] text-[var(--text-ink)] mb-3">{col.title}</h2>
              <ul className="space-y-1 text-[13px] text-[var(--text-muted)]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {/* py-1.5 keeps each link an easy tap target on phones */}
                    <Link href={l.href} className="inline-block py-1.5 hover:text-[var(--brand-mark)] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="pt-8 border-t border-[var(--border-line)] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[var(--text-muted)] gap-3">
          <p>&copy; {new Date().getFullYear()} YT Niches (ytniches.com) &bull; All rights reserved.</p>
          <p>YouTube is a trademark of Google LLC.</p>
        </div>
      </div>
    </footer>
  );
}
