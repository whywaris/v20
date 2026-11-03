import Link from 'next/link';
import { BookOpen, FilePen, Flame, Inbox, Layers, PenLine, Plus, Send, UserPlus, Users, Video } from 'lucide-react';
import { PageHeader, SetupNote, StatCard, cardCls, shortDate } from '@/components/admin/ui';
import { latest, listUsers, signedUpWithin, overrideCount, pendingSubmissions, postCount, unreadMessages, type Message } from '@/lib/admin-queries';
import { getChannels, getNiches, getOutliers } from '@/lib/data';

export default async function AdminDashboard() {
  const [channels, niches, users, unread, pending, edits, published, drafts, messages] = await Promise.all([
    getChannels(),
    getNiches(),
    listUsers(),
    unreadMessages(),
    pendingSubmissions(),
    overrideCount(),
    postCount('published'),
    postCount('draft'),
    latest<Message>('messages', 5),
  ]);
  const newUsers = signedUpWithin(users.users, 7);
  const setup = users.missing || unread.missing || edits.missing;

  return (
    <>
      <PageHeader title="Dashboard" description="Live numbers from the catalog and Supabase.">
        <Link href="/admin/channels?new=1" className="btn-accent inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[12.5px]">
          <Plus className="size-4" /> Add channel
        </Link>
        <Link href="/admin/blog" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border-line)] px-3 text-[12.5px] font-semibold text-[var(--text-ink)] hover:bg-[var(--bg-surface-2)]">
          <PenLine className="size-4" /> New post
        </Link>
      </PageHeader>
      <SetupNote text={setup} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Channels (live)" value={channels.length} icon={Video} href="/admin/channels" />
        <StatCard label="Niches (live)" value={niches.length} icon={Layers} href="/admin/niches" />
        <StatCard label="Outlier videos" value={getOutliers().length} icon={Flame} />
        <StatCard label="Catalog edits" value={edits.value} icon={FilePen} href="/admin/channels?status=edited" />
        <StatCard label="Users" value={users.users.length} icon={Users} href="/admin/users" />
        <StatCard label="New users (7 days)" value={newUsers} icon={UserPlus} href="/admin/users" />
        <StatCard label="Unread messages" value={unread.value} icon={Inbox} href="/admin/inbox" />
        <StatCard label="Pending submissions" value={pending.value} icon={Send} href="/admin/inbox?tab=submissions" />
        <StatCard label="Published posts" value={published.value} icon={BookOpen} href="/admin/blog" note={published.missing} />
        <StatCard label="Draft posts" value={drafts.value} icon={FilePen} href="/admin/blog" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className={`${cardCls} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-ink)]">Latest sign-ups</h2>
            <Link href="/admin/users" className="text-[13px] font-semibold text-[var(--brand-mark)] hover:underline">All users →</Link>
          </div>
          {users.users.length ? (
            <ul className="divide-y divide-[var(--border-line)]">
              {users.users.slice(0, 5).map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                  <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-surface-2)] text-[11px] font-bold uppercase text-[var(--text-muted)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {u.avatar ? <img src={u.avatar} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : (u.name || u.email).charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[var(--text-ink)]">{u.name || u.email}</div>
                    <div className="truncate text-[12px] text-[var(--text-muted)]">{u.email}</div>
                  </div>
                  <span className="shrink-0 text-[12px] text-[var(--text-muted)]">{shortDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)]">No sign-ups yet.</p>
          )}
        </section>

        <section className={`${cardCls} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-ink)]">Latest messages</h2>
            <Link href="/admin/inbox" className="text-[13px] font-semibold text-[var(--brand-mark)] hover:underline">Open inbox →</Link>
          </div>
          {messages.rows.length ? (
            <ul className="divide-y divide-[var(--border-line)]">
              {messages.rows.map((m) => (
                <li key={m.id} className="py-2.5 text-[13px]">
                  <div className="flex items-center gap-2">
                    {m.status === 'new' && <span className="size-2 shrink-0 rounded-full bg-[var(--brand-accent)]" />}
                    <span className="truncate font-semibold text-[var(--text-ink)]">{m.subject || '(no subject)'}</span>
                    <span className="ml-auto shrink-0 text-[12px] text-[var(--text-muted)]">{shortDate(m.created_at)}</span>
                  </div>
                  <div className="truncate text-[12px] text-[var(--text-muted)]">{m.name} · {m.body}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)]">No messages yet. They arrive from the contact form.</p>
          )}
        </section>
      </div>
    </>
  );
}
