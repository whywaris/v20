'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Mail, MailOpen } from 'lucide-react';
import { useAdminToast } from '@/components/admin/AdminToast';
import { btnGhost, cardCls, shortDate } from '@/components/admin/ui';
import type { Message } from '@/lib/admin-queries';

/** Contact form messages: open to read (marks it read), reply by email, archive. */
export default function InboxManager({ messages }: { messages: Message[] }) {
  const toast = useAdminToast();
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const setStatus = async (id: number, status: string, done?: string) => {
    const res = await fetch('/api/admin/inbox', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error || 'Failed', 'error');
    if (done) toast(done);
    router.refresh();
  };

  const visible = messages.filter((m) => showArchived || m.status !== 'archived');

  return (
    <>
      <div className="mb-4 flex justify-end">
        <label className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[var(--brand-mark)]" />
          Show archived
        </label>
      </div>

      <div className={`${cardCls} divide-y divide-[var(--border-line)]`}>
        {visible.map((m) => (
          <div key={m.id} className={m.status === 'archived' ? 'opacity-60' : ''}>
            <button
              type="button"
              onClick={() => {
                setOpen(open === m.id ? null : m.id);
                if (m.status === 'new') setStatus(m.id, 'read');
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
                    <button type="button" onClick={() => setStatus(m.id, 'archived', 'Archived.')} className={btnGhost}>
                      <Archive className="size-3.5" /> Archive
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStatus(m.id, 'read', 'Moved back to inbox.')} className={btnGhost}>
                      Unarchive
                    </button>
                  )}
                  <button type="button" onClick={() => setStatus(m.id, 'new')} className={btnGhost}>Mark unread</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!visible.length && <p className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No messages. They arrive from the contact page.</p>}
      </div>
    </>
  );
}
