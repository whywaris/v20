'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bookmark, Sun, Moon, LogIn, Compass, Layers, BookOpen, Flame } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('yt_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('yt_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navLinks = [
    { href: '/', label: 'Channels', icon: Compass },
    { href: '/niche', label: 'Niches', icon: Layers },
    { href: '/outliers', label: 'Viral Outliers', icon: Flame },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-line)] glass transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-accent)] text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="size-4 fill-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[var(--text-ink)]">
              YT <span className="text-[var(--brand-mark)]">Niches</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-[13.5px] font-medium">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-[var(--bg-surface-2)] text-[var(--text-ink)] font-semibold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]/60'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex size-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* Sign in with Google (Gated modal trigger) */}
          <button
            onClick={() => {
              alert('Supabase Google OAuth modal: Connect to unlock 7,467 channel revenue stats & daily growth charts.');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border border-[var(--border-line-strong)] text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            <LogIn className="size-3.5 text-[var(--brand-mark)]" />
            Sign In
          </button>

          {/* Newsletter Subscribe CTA */}
          <a
            href="#newsletter"
            className="btn-accent inline-flex items-center justify-center h-8 px-3.5 text-[12.5px] rounded-full shadow-sm"
          >
            Weekly Report
          </a>
        </div>
      </div>
    </header>
  );
}
