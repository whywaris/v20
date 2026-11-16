import Link from 'next/link';
import { Info } from 'lucide-react';

/** Shown near the top of every article that talks about RPM, income or earnings. */
export default function EarningsNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] px-4 py-3 text-[13.5px] text-[var(--text-muted)] ${className}`}>
      <Info className="mt-0.5 size-4 shrink-0 text-[var(--brand-mark)]" />
      <span>
        Income figures are estimates, not guarantees. Results vary. See our{' '}
        <Link href="/disclaimer" className="font-semibold text-[var(--brand-mark)] hover:underline">Earnings Disclaimer</Link>.
      </span>
    </p>
  );
}
