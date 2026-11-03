'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Search, ShieldCheck, ShieldOff, Undo2 } from 'lucide-react';
import { useAdminToast } from '@/components/admin/AdminToast';
import { btnGhost, cardCls, inputCls, shortDate } from '@/components/admin/ui';
import type { AdminUser } from '@/lib/admin-queries';

export default function UsersManager({ users, me }: { users: AdminUser[]; me: string }) {
  const toast = useAdminToast();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const shown = useMemo(() => {
    const s = q.toLowerCase().trim();
    return s ? users.filter((u) => u.email.toLowerCase().includes(s) || u.name.toLowerCase().includes(s)) : users;
  }, [users, q]);

  const patch = async (u: AdminUser, change: { role?: string; blocked?: boolean }, done: string) => {
    setBusy(u.id);
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, ...change }) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(data.error || 'Failed', 'error');
    toast(done);
    router.refresh();
  };

  return (
    <>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className={`${inputCls} pl-9`} />
      </div>
      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[var(--border-line)] bg-[var(--bg-surface-2)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-3 py-3 font-semibold">Joined</th>
                <th className="px-3 py-3 font-semibold">Last sign-in</th>
                <th className="px-3 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-line)]">
              {shown.map((u) => {
                const self = u.id === me;
                return (
                  <tr key={u.id} className={u.banned ? 'opacity-60' : ''}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-surface-2)] text-[11px] font-bold uppercase text-[var(--text-muted)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {u.avatar ? <img src={u.avatar} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : (u.name || u.email).charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <div className="max-w-[240px] truncate font-semibold text-[var(--text-ink)]">
                            {u.name || '—'} {self && <span className="text-[11px] font-normal text-[var(--text-muted)]">(you)</span>}
                          </div>
                          <div className="max-w-[240px] truncate text-[12px] text-[var(--text-muted)]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[var(--text-muted)]">{shortDate(u.createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[var(--text-muted)]">{shortDate(u.lastSignIn)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.role === 'admin' ? 'bg-[var(--brand-accent)]/15 text-[var(--brand-mark)]' : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)]'}`}>
                        {u.role}
                      </span>
                      {u.banned && <span className="ml-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-300">blocked</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        {u.role === 'admin' ? (
                          <button type="button" disabled={self || busy === u.id} onClick={() => confirm(`Remove admin from ${u.email}?`) && patch(u, { role: 'user' }, 'Admin removed.')} className={btnGhost} title="Remove admin">
                            <ShieldOff className="size-3.5" /> Remove admin
                          </button>
                        ) : (
                          <button type="button" disabled={self || busy === u.id || u.banned} onClick={() => confirm(`Make ${u.email} an admin? They will be able to change the whole site.`) && patch(u, { role: 'admin' }, 'Now an admin.')} className={btnGhost} title="Make admin">
                            <ShieldCheck className="size-3.5" /> Make admin
                          </button>
                        )}
                        {u.banned ? (
                          <button type="button" disabled={self || busy === u.id} onClick={() => patch(u, { blocked: false }, 'Unblocked.')} className={btnGhost}>
                            <Undo2 className="size-3.5" /> Unblock
                          </button>
                        ) : (
                          <button type="button" disabled={self || busy === u.id} onClick={() => confirm(`Block ${u.email}? They won't be able to sign in.`) && patch(u, { blocked: true }, 'Blocked.')} className={`${btnGhost} text-rose-600 dark:text-rose-400`}>
                            <Ban className="size-3.5" /> Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-muted)]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
