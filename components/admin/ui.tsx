import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

// Small building blocks shared by the admin pages.

export const inputCls =
  'w-full h-10 px-3 rounded-xl text-[13px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]';
export const labelCls = 'block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1';
export const cardCls = 'rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)]';
export const btnGhost =
  'inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border-line)] px-3 text-[12.5px] font-semibold text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)] disabled:opacity-40';

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-ink)]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-[var(--text-muted)]">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, href, note }: { label: string; value: number | string; icon: LucideIcon; href?: string; note?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-[12.5px] text-[var(--text-muted)]">
        {label}
        <Icon className="size-4 text-[var(--brand-mark)]" />
      </div>
      <div className="num-mono mt-2 text-2xl font-bold text-[var(--text-ink)]">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {note && <div className="mt-1 text-[11.5px] text-amber-600 dark:text-amber-400">{note}</div>}
    </>
  );
  return href ? (
    <Link href={href} className={`${cardCls} block p-4 transition-colors hover:border-[var(--brand-accent)]/50`}>{body}</Link>
  ) : (
    <div className={`${cardCls} p-4`}>{body}</div>
  );
}

/** Yellow notice when a feature needs setup (missing table or env var). */
export function SetupNote({ text }: { text?: string }) {
  if (!text) return null;
  return <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-300">{text}</div>;
}

export const STATUS_BADGE: Record<string, string> = {
  edited: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  hidden: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300',
  new: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

export const shortDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
