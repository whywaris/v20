import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, FileText, AlertCircle } from 'lucide-react';

export default function Footer() {
  const topNiches = [
    { label: 'Faceless History', href: '/niche/history' },
    { label: 'Crystals & Spirituality', href: '/niche/crystals-spirituality' },
    { label: 'True Crime & Mysteries', href: '/niche/crime' },
    { label: 'Animation & Storytelling', href: '/niche/animation' },
    { label: 'Science & Space', href: '/niche/science' },
    { label: 'Frugal Living & Money', href: '/niche/frugal-living' },
    { label: 'AI & Tech Documentaries', href: '/niche/education' },
    { label: 'Homesteading & Prepping', href: '/niche/homesteading' }
  ];

  return (
    <footer className="w-full border-t border-[var(--border-line)] bg-[var(--bg-surface)] py-12 px-4 sm:px-6 transition-colors duration-200 mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-accent)] text-white shadow-sm">
                <Sparkles className="size-4 fill-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-[var(--text-ink)]">
                YT <span className="text-[var(--brand-mark)]">Niches</span>
              </span>
            </Link>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-4">
              The world's largest public directory of YouTube niches, benchmark AdSense RPM, and viral video swipe files.
            </p>
            <div className="text-[12px] text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
              <span>Canonical:</span>
              <a href="https://ytniches.com/" className="text-[var(--brand-mark)] hover:underline">
                https://ytniches.com/
              </a>
            </div>
          </div>

          {/* Col 2: Top Niches */}
          <div>
            <h4 className="font-semibold text-[13.5px] text-[var(--text-ink)] mb-3">Popular Niches</h4>
            <ul className="space-y-2 text-[13px] text-[var(--text-muted)]">
              {topNiches.slice(0, 4).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-[var(--brand-mark)] transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Categories */}
          <div>
            <h4 className="font-semibold text-[13.5px] text-[var(--text-ink)] mb-3">Breakout Categories</h4>
            <ul className="space-y-2 text-[13px] text-[var(--text-muted)]">
              {topNiches.slice(4).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-[var(--brand-mark)] transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <h4 className="font-semibold text-[13.5px] text-[var(--text-ink)] mb-3">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-[13px] text-[var(--text-muted)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--brand-mark)] transition-colors inline-flex items-center gap-1.5">
                  <Shield className="size-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--brand-mark)] transition-colors inline-flex items-center gap-1.5">
                  <FileText className="size-3" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--brand-mark)] transition-colors inline-flex items-center gap-1.5">
                  <AlertCircle className="size-3" /> Earnings Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--brand-mark)] transition-colors">
                  Research &amp; Case Studies
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[var(--border-line)] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[var(--text-muted)] gap-4">
          <p>&copy; {new Date().getFullYear()} YT Niches (ytniches.com) &bull; All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/disclaimer" className="hover:underline">Earnings Disclaimer</Link>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <Link href="/admin" className="hover:underline text-[var(--text-muted)] opacity-60 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
