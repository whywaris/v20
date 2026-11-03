'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

const field =
  'h-11 w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface-2)] px-4 text-[14px] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-mark)] focus:outline-none';

/** "Suggest a channel" box at the bottom of /channels; suggestions are reviewed in /admin/inbox. */
export default function SuggestChannel() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState('sending');
    setError('');
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(f)),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      form.reset();
      return setState('sent');
    }
    setError(data?.error || 'Could not send right now. Please try again later.');
    setState('idle');
  };

  return (
    <section className="mt-14 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:p-6" aria-labelledby="suggest-title">
      <h2 id="suggest-title" className="text-lg font-bold text-[var(--text-ink)]">Know a small channel we&apos;re missing?</h2>
      <p className="mt-1 text-[14px] text-[var(--text-muted)]">Send us the link. We review every suggestion (channels must be under 250k subscribers).</p>
      {state === 'sent' ? (
        <p className="mt-4 text-[14px] font-semibold text-emerald-600 dark:text-emerald-400" role="status">Thanks! We&apos;ll take a look.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          <input name="url" required maxLength={300} placeholder="https://www.youtube.com/@channel" aria-label="YouTube channel link" className={field} />
          <input name="niche" maxLength={100} placeholder="Niche (optional)" aria-label="Niche" className={field} />
          <button type="submit" disabled={state === 'sending'} className="btn-accent inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[14px] disabled:opacity-60">
            <Send className="size-4" /> {state === 'sending' ? 'Sending…' : 'Suggest'}
          </button>
          {error && <p className="text-[13px] text-rose-500 sm:col-span-3" aria-live="polite">{error}</p>}
        </form>
      )}
    </section>
  );
}
