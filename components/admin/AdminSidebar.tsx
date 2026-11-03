'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ExternalLink, Gauge, Inbox, Layers, LogOut, Menu, SearchCheck, Shield, Users, Video, X } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/channels', label: 'Channels', icon: Video },
  { href: '/admin/niches', label: 'Niches', icon: Layers },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/seo', label: 'SEO & Health', icon: SearchCheck },
];

export default function AdminSidebar({ email, unread }: { email: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-3 text-[14px]">
      <div className="mb-3 flex items-center gap-2 px-2 py-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-accent)]/15 text-[var(--brand-mark)]">
          <Shield className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-[var(--text-ink)]">Admin</div>
          <div className="truncate text-[11px] text-[var(--text-muted)]" title={email}>{email}</div>
        </div>
      </div>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex min-h-10 items-center gap-2.5 rounded-xl px-3 font-medium transition-colors ${
            isActive(href)
              ? 'bg-[var(--brand-accent)] text-white'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-ink)]'
          }`}
        >
          <Icon className="size-4" />
          <span className="flex-1">{label}</span>
          {href === '/admin/inbox' && unread > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isActive(href) ? 'bg-white/25' : 'bg-[var(--brand-accent)] text-white'}`}>
              {unread}
            </span>
          )}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-[var(--border-line)] pt-3">
        <Link href="/" target="_blank" className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-ink)]">
          <ExternalLink className="size-4" /> View site
        </Link>
        <form action="/auth/signout?next=/" method="post">
          <button type="submit" className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-rose-500 hover:bg-rose-500/10">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile: top bar with a menu button and a slide-in drawer */}
      <div className="flex items-center justify-between border-b border-[var(--border-line)] px-4 py-2 lg:hidden">
        <span className="text-[14px] font-bold text-[var(--text-ink)]">{NAV.find((n) => isActive(n.href))?.label ?? 'Admin'}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close admin menu' : 'Open admin menu'}
          aria-expanded={open}
          className="flex size-11 items-center justify-center rounded-xl text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border-line)] bg-[var(--bg-surface)] transition-transform lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
