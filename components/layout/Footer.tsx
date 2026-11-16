import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { NOT_AFFILIATED } from '@/lib/site';

type FooterLink = { label: string; href: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
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
];

export default function Footer({ categories }: { categories: { name: string; slug: string }[] }) {
  // Blog categories first (same order as the navbar), then the fixed columns. No categories yet: no column.
  const columns = [
    ...(categories.length ? [{ title: 'Categories', links: categories.map((c) => ({ label: c.name, href: `/blog/category/${c.slug}` })) }] : []),
    ...COLUMNS,
  ];
  return (
    <footer className="w-full border-t border-[var(--border-line)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 transition-colors duration-200 mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mb-12">
          {/* Col 1: Brand & mission */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:pr-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-accent)] text-white shadow-sm">
                <Sparkles className="size-4 fill-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-[var(--text-ink)]">
                YT <span className="text-[var(--brand-mark)]">Niches</span>
              </span>
            </Link>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Practical guides on finding a profitable YouTube niche, growing a faceless channel and turning views into
              income.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
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
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} YT Niches &bull; All rights reserved.</p>
            <p className="text-[11.5px] text-[var(--text-muted)] opacity-80">{NOT_AFFILIATED}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
