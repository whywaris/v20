import Link from 'next/link';
import { PenLine } from 'lucide-react';

/** Shown on the homepage and /blog until the first article is published. */
export default function BlogEmpty() {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border-line-strong)] px-6 py-16 text-center">
      <PenLine className="mx-auto size-8 text-[var(--brand-mark)]" />
      <h2 className="mt-4 text-xl font-bold text-[var(--text-ink)]">New articles are on the way</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--text-muted)]">
        Guides on finding a profitable YouTube niche, growing a faceless channel and monetizing it are being written now.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/about" className="inline-flex h-11 items-center rounded-full border border-[var(--border-line-strong)] px-6 text-[14px] font-semibold text-[var(--text-ink)]">
          About YT Niches
        </Link>
        <Link href="/contact" className="btn-accent inline-flex h-11 items-center rounded-full px-6 text-[14px]">
          Suggest a topic
        </Link>
      </div>
    </div>
  );
}
