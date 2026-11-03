'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site';

const TOPICS = ['General question', 'Correct or remove a channel', 'Advertising & partnerships', 'Privacy request', 'Bug report'];
const field =
  'w-full min-h-11 px-4 py-2.5 rounded-xl text-[14px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)]';

// Sends to /api/contact (read in /admin/inbox). If that fails, falls back to opening the visitor's email app.
export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mailto'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState('sending');
    setError('');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: f.get('name'), email: f.get('email'), subject: f.get('topic'), message: f.get('message'), website: f.get('website') }),
    }).catch(() => null);
    if (res?.ok) {
      form.reset();
      return setState('sent');
    }
    const data = await res?.json().catch(() => null);
    if (res && res.status === 400) {
      setError(data?.error || 'Please check the form.');
      return setState('idle');
    }
    // Server unavailable: open the email app with the message filled in instead.
    const subject = `[${f.get('topic')}] ${f.get('name')}`;
    const body = `${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setState('mailto');
  };

  if (state === 'sent') {
    return (
      <div className="glass rounded-2xl border border-[var(--border-line)] p-6 text-center" role="status">
        <h3 className="text-lg font-bold text-[var(--text-ink)]">Thanks, your message was sent.</h3>
        <p className="mt-2 text-[14px] text-[var(--text-muted)]">We usually reply within 24–48 hours.</p>
        <button type="button" onClick={() => setState('idle')} className="mt-4 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl border border-[var(--border-line)] p-5 sm:p-6 space-y-4">
      {/* Honeypot: hidden from people, filled in by bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
          Your name
          <input name="name" required maxLength={120} autoComplete="name" className={field} />
        </label>
        <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
          Your email
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
        Topic
        <select name="topic" className={field} defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
        Message
        <textarea name="message" required rows={6} maxLength={5000} className={`${field} resize-y`} />
      </label>
      <button type="submit" disabled={state === 'sending'} className="btn-accent inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 px-6 rounded-xl text-[14px] font-semibold disabled:opacity-60">
        <Send className="size-4" /> {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <p className={`text-[12px] ${error ? 'text-rose-500' : 'text-[var(--text-muted)]'}`} aria-live="polite">
        {error ||
          (state === 'mailto'
            ? `Your email app should now be open with the message ready to send. If nothing happened, email ${CONTACT_EMAIL} directly.`
            : `Or email us at ${CONTACT_EMAIL}.`)}
      </p>
    </form>
  );
}
