import Link from 'next/link';
import { Search } from 'lucide-react';

// Popular searches land on the full directory with that filter applied.
const POPULAR = [
  { label: 'Finance', href: '/channels?category=Finance' },
  { label: 'AI Avatar', href: '/channels?format=avatar' },
  { label: 'Faceless', href: '/channels?format=faceless' },
  { label: 'True Crime', href: '/channels?category=Crime' },
  { label: 'History', href: '/channels?category=History' },
  { label: 'Science', href: '/channels?category=Science' },
];

/** Native GET form to /channels: works without JavaScript and is reused in the closing band. */
export function SearchForm({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const lg = size === 'lg';
  return (
    <form
      action="/channels"
      method="get"
      role="search"
      className={`flex w-full items-center gap-2 border-2 border-[var(--border-line-strong)] bg-[var(--bg-surface)] focus-within:border-[var(--brand-mark)] focus-within:ring-4 focus-within:ring-[var(--brand-accent)]/15 ${
        lg ? 'rounded-2xl p-2 shadow-2xl shadow-[var(--brand-accent)]/10' : 'rounded-2xl p-1.5 shadow-lg shadow-black/5'
      }`}
    >
      <Search className={`ml-3 shrink-0 text-[var(--text-muted)] ${lg ? 'size-6' : 'size-5'}`} />
      <input
        type="search"
        name="q"
        required
        placeholder="Search a niche, topic or channel…"
        aria-label="Search channels"
        className={`min-w-0 flex-1 bg-transparent text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none ${lg ? 'h-14 text-[17px] sm:text-lg' : 'h-11 text-[15px]'}`}
      />
      <button type="submit" className={`btn-accent shrink-0 rounded-xl ${lg ? 'h-14 px-5 text-[16px] sm:px-8' : 'h-11 px-5 text-[14px]'}`}>
        Search
      </button>
    </form>
  );
}

export default function HeroBanner({
  totalChannelsCount,
  totalNichesCount,
  totalVideosCount,
}: {
  totalChannelsCount: number;
  totalNichesCount: number;
  totalVideosCount: number;
}) {
  return (
    <section className="relative mx-auto max-w-3xl py-14 text-center sm:py-24">
      {/* Soft brand glow behind the headline */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-64 max-w-xl rounded-full bg-[var(--brand-accent)]/15 blur-3xl" />

      <span className="relative inline-flex items-center gap-2 rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Updated for 2026 · 100% free
      </span>

      <h1 className="relative mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-[var(--text-ink)] sm:text-6xl lg:text-7xl">
        Find YouTube niches that pay well <span className="text-[var(--brand-accent)]">and aren&apos;t crowded yet</span>
      </h1>
      <p className="relative mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)] sm:text-lg">
        Study {totalChannelsCount.toLocaleString()} small channels (all under 250k subscribers) that already earn, see which videos broke
        out, and pick your niche with real numbers.
      </p>

      <div className="relative mx-auto mt-10 max-w-2xl">
        <SearchForm />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[13px]">
          <span className="text-[var(--text-muted)]">Popular:</span>
          {POPULAR.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1.5 font-medium text-[var(--text-ink)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-mark)]"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="relative mt-10 text-[13px] text-[var(--text-muted)]">
        <strong className="num-mono text-[var(--text-ink)]">{totalChannelsCount.toLocaleString()}</strong> channels ·{' '}
        <strong className="num-mono text-[var(--text-ink)]">{totalNichesCount.toLocaleString()}</strong> niches ·{' '}
        <strong className="num-mono text-[var(--text-ink)]">{totalVideosCount.toLocaleString()}</strong> outlier videos
      </p>
    </section>
  );
}
