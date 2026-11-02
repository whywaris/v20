'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site';

const TOPICS = ['General question', 'Correct or remove a channel', 'Advertising & partnerships', 'Privacy request', 'Bug report'];
const field =
  'w-full min-h-11 px-4 py-2.5 rounded-xl text-[14px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)]';

// No server or database: submitting opens the visitor's email app with the message filled in.
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `[${f.get('topic')}] ${f.get('name')}`;
    const body = `${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl border border-[var(--border-line)] p-5 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
          Your name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block space-y-1.5 text-[13px] font-medium text-[var(--text-ink)]">
          Your email
          <input name="email" type="email" required autoComplete="email" className={field} />
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
        <textarea name="message" required rows={6} maxLength={4000} className={`${field} resize-y`} />
      </label>
      <button type="submit" className="btn-accent inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 px-6 rounded-xl text-[14px] font-semibold">
        <Send className="size-4" /> Send message
      </button>
      <p className="text-[12px] text-[var(--text-muted)]" aria-live="polite">
        {opened
          ? `Your email app should now be open with the message ready to send. If nothing happened, email ${CONTACT_EMAIL} directly.`
          : 'Sending opens your email app with your message filled in, so you keep a copy.'}
      </p>
    </form>
  );
}
