'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bookmark, Sun, Moon, LogIn, Compass, Layers, BookOpen, Flame, Menu, X, Shield } from 'lucide-react';

const signIn = () => {
  alert('Supabase Google OAuth modal: Connect to unlock 6,800+ channel revenue stats & daily growth charts.');
};

export default function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('yt_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // While the mobile drawer is open: no background scrolling, Escape closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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
  const mobileLinks = [...navLinks, { href: '/admin', label: 'Admin', icon: Shield }];
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-line)] glass transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    isActive(item.href)
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
          {/* Theme Toggle (desktop; on mobile it lives in the drawer) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden md:flex size-9 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* Sign in with Google (Gated modal trigger) */}
          <button
            onClick={signIn}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border border-[var(--border-line-strong)] text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            <LogIn className="size-3.5 text-[var(--brand-mark)]" />
            Sign In
          </button>

          {/* Newsletter Subscribe CTA */}
          <a
            href="#newsletter"
            onClick={closeMenu}
            className="btn-accent inline-flex items-center justify-center h-11 md:h-8 px-3.5 text-[12.5px] rounded-full shadow-sm"
          >
            Weekly Report
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex md:hidden size-11 items-center justify-center rounded-full text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer: tap the backdrop, a link, the X or press Escape to close */}
      <div className="md:hidden">
        <div
          aria-hidden
          onClick={closeMenu}
          className={`fixed inset-0 top-14 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          inert={!menuOpen}
          className={`fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-[var(--border-line)] bg-[var(--bg-surface)] px-4 pb-6 pt-2 shadow-2xl transition-all duration-200 ease-out ${
            menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <ul className="flex flex-col gap-1">
            {mobileLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
                      active
                        ? 'bg-[var(--bg-surface-2)] text-[var(--text-ink)] font-semibold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-ink)]'
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 border-t border-[var(--border-line)] pt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-12 items-center justify-between rounded-xl px-3 text-[15px] font-medium text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] transition-colors"
            >
              <span className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">Switch to {theme === 'dark' ? 'light' : 'dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                signIn();
              }}
              className="btn-accent flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold shadow-md"
            >
              <LogIn className="size-[18px]" />
              Sign in with Google
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
