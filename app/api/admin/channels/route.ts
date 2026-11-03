import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminUser } from '@/lib/admin';
import { adminView, cleanChannelEdit, newChannel } from '@/lib/admin-catalog';
import { adminOverrides, resetOverride, saveOverride } from '@/lib/admin-store';
import { baseChannels, channelKey, getBaseChannel } from '@/lib/data';

const fail = (e: unknown, status = 500) => NextResponse.json({ error: (e as Error).message ?? String(e) }, { status });

// GET ?search=&status=edited|hidden|new&page=&limit= : catalog with admin edits applied, hidden items included.
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const search = (sp.get('search') || '').toLowerCase().trim();
  const status = sp.get('status') || '';
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 20));

  const all = adminView(baseChannels(), await adminOverrides('channel'), channelKey);
  const filtered = all.filter(
    (c) =>
      (!status || c._status === status) &&
      (!search ||
        c.title?.toLowerCase().includes(search) ||
        c.handle?.toLowerCase().includes(search) ||
        (c.categories || []).some((cat) => cat.toLowerCase().includes(search)))
  );
  const items = filtered.slice((page - 1) * limit, page * limit).map(({ popularVideos, deepAnalysis, offers, ...c }) => c); // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json({ items, total: filtered.length, page, totalPages: Math.ceil(filtered.length / limit) });
}

// POST: add a channel.
export async function POST(request: Request) {
  const { user, denied } = await requireAdminUser();
  if (denied) return denied;
  try {
    const made = newChannel(await request.json());
    if ('error' in made) return fail(new Error(made.error), 400);
    if (getBaseChannel(made.id)) return fail(new Error('A channel with this handle already exists'), 409);
    await saveOverride('channel', made.id, { data: made.data, hidden: false }, user.id);
    return NextResponse.json({ success: true, id: made.id });
  } catch (e) {
    return fail(e);
  }
}

// PUT { id, ...fields } edits; { id, hidden: true|false } hides or restores.
export async function PUT(request: Request) {
  const { user, denied } = await requireAdminUser();
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return fail(new Error('Channel id required'), 400);
    const data = cleanChannelEdit(body);
    const hidden = typeof body.hidden === 'boolean' ? body.hidden : undefined;
    if (!Object.keys(data).length && hidden === undefined) return fail(new Error('Nothing to change'), 400);
    await saveOverride('channel', id, { data, hidden }, user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return fail(e);
  }
}

// DELETE ?id= : drop all edits (back to the catalog; an admin-added channel is removed).
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fail(new Error('Channel id required'), 400);
  try {
    await resetOverride('channel', id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return fail(e);
  }
}
