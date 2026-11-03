'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, Check, Mail, MailOpen, Plus, X } from 'lucide-react';
import { useAdminToast } from '@/components/admin/AdminToast';
import { btnGhost, cardCls, shortDate } from '@/components/admin/ui';
import type { Message, Submission } from '@/lib/admin-queries';

export default function InboxManager({ messages, submissions, initialTab }: { messages: Message[]; submissions: Submission[]; initialTab: 'messages' | 'submissions' }) {
  const toast = useAdminToast();
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const setStatus = async (table: 'messages' | 'submissions', id: number, status: string, done?: string) => {
    const res = await fetch('/api/admin/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, id, status }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error || 'Failed', 'error');
    if (done) toast(done);
    router.refresh();
  };

  const visible = messages.filter((m) => showArchived || m.status !== 'archived');
  const unread = messages.filter((m) => m.status === 'new').length;
  const pending = submissions.filter((s) => s.status === 'pending').length;

  const tabBtn = (id: typeof tab, label: string, n: number) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`h-9 rounded-lg px-4 text-[13px] font-semibold ${tab === id ? 'bg-[var(--bg-surface-2)] text-[var(--text-ink)]' : 'text-[var(--text-muted)]'}`}
    >
      {label} {n > 0 && <span className="ml-1 rounded-full bg-[var(--brand-accent)] px-1.5 text-[11px] text-white">{n}</span>}
    </button>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-xl border border-[var(--border-line)] p-1">
          {tabBtn('messages', 'Messages', unread)}
          {tabBtn('submissions', 'Channel suggestions', pending)}
        </div>
        {tab === 'messages' && (
          <label className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[var(--brand-mark)]" />
            Show archived
          </label>
        )}
      </div>

      {tab === 'messages' ? (
        <div className={`${cardCls} divide-y divide-[var(--border-line)]`}>
          {visible.map((m) => (
            <div key={m.id} className={m.status === 'archived' ? 'opacity-60' : ''}>
              <button
                type="button"
                onClick={() => {
                  setOpen(open === m.id ? null : m.id);
                  if (m.status === 'new') setStatus('messages', m.id, 'read');
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-surface-2)]"
              >
                {m.status === 'new' ? <Mail className="mt-0.5 size-4 shrink-0 text-[var(--brand-mark)]" /> : <MailOpen className="mt-0.5 size-4 shrink-0 text-[var(--text-muted)]" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13.5px]">
                    <span className={`truncate ${m.status === 'new' ? 'font-bold text-[var(--text-ink)]' : 'font-medium text-[var(--text-ink)]'}`}>{m.subject || '(no subject)'}</span>
                    <span className="ml-auto shrink-0 text-[12px] text-[var(--text-muted)]">{shortDate(m.created_at)}</span>
                  </div>
                  <div className="truncate text-[12.5px] text-[var(--text-muted)]">{m.name} &lt;{m.email}&gt;</div>
                </div>
              </button>
              {open === m.id && (
                <div className="px-4 pb-4 pl-11">
                  <p className="whitespace-pre-wrap rounded-xl bg-[var(--bg-surface-2)] p-3 text-[13.5px] text-[var(--text-ink)]">{m.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'your message to YT Niches'}`)}`} className="btn-accent inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[12.5px]">
                      <Mail className="size-3.5" /> Reply by email
                    </a>
                    {m.status !== 'archived' ? (
                      <button type="button" onClick={() => setStatus('messages', m.id, 'archived', 'Archived.')} className={btnGhost}>
                        <Archive className="size-3.5" /> Archive
                      </button>
                    ) : (
                      <button type="button" onClick={() => setStatus('messages', m.id, 'read', 'Moved back to inbox.')} className={btnGhost}>
                        Unarchive
                      </button>
                    )}
                    <button type="button" onClick={() => setStatus('messages', m.id, 'new')} className={btnGhost}>Mark unread</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!visible.length && <p className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No messages. They arrive from the contact page.</p>}
        </div>
      ) : (
        <div className={`${cardCls} divide-y divide-[var(--border-line)]`}>
          {submissions.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[13px]">
              <div className="min-w-0 flex-1">
                <a href={s.channel_url} target="_blank" rel="noopener noreferrer nofollow" className="block truncate font-semibold text-[var(--brand-mark)] hover:underline">{s.channel_url}</a>
                <div className="truncate text-[12.5px] text-[var(--text-muted)]">
                  {[s.suggested_niche && `Niche: ${s.suggested_niche}`, s.email, s.note, shortDate(s.created_at)].filter(Boolean).join(' · ')}
                </div>
              </div>
              {s.status === 'pending' ? (
                <div className="flex gap-1">
                  <Link
                    href={`/admin/channels?new=1&url=${encodeURIComponent(s.channel_url)}`}
                    onClick={() => setStatus('submissions', s.id, 'approved')}
                    className="btn-accent inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[12.5px]"
                  >
                    <Plus className="size-3.5" /> Approve &amp; add
                  </Link>
                  <button type="button" onClick={() => setStatus('submissions', s.id, 'rejected', 'Rejected.')} className={btnGhost}>
                    <X className="size-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.status === 'approved' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300'}`}>
                  {s.status === 'approved' && <Check className="size-3" />} {s.status}
                </span>
              )}
            </div>
          ))}
          {!submissions.length && <p className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No channel suggestions yet. Visitors can suggest one at the bottom of /channels.</p>}
        </div>
      )}
    </>
  );
}
