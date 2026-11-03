import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminUser } from '@/lib/admin';
import { adminView, cleanNicheEdit, newNiche } from '@/lib/admin-catalog';
import { adminOverrides, resetOverride, saveOverride } from '@/lib/admin-store';
import { baseNiches, getBaseNiche, nicheKey } from '@/lib/data';

const fail = (e: unknown, status = 500) => NextResponse.json({ error: (e as Error).message ?? String(e) }, { status });

// GET ?search=&status=edited|hidden|new&page=&limit=
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const search = (sp.get('search') || '').toLowerCase().trim();
  const status = sp.get('status') || '';
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 20));

  const all = adminView(baseNiches(), await adminOverrides('niche'), nicheKey);
  const filtered = all.filter(
    (n) => (!status || n._status === status) && (!search || n.name.toLowerCase().includes(search) || n.slug.includes(search))
  );
  const items = filtered.slice((page - 1) * limit, page * limit);
  return NextResponse.json({ items, total: filtered.length, page, totalPages: Math.ceil(filtered.length / limit) });
}

// POST: add a niche.
export async function POST(request: Request) {
  const { user, denied } = await requireAdminUser();
  if (denied) return denied;
  try {
    const made = newNiche(await request.json());
    if ('error' in made) return fail(new Error(made.error), 400);
    if (getBaseNiche(made.slug)) return fail(new Error('A niche with this name already exists'), 409);
    await saveOverride('niche', made.slug, { data: made.data, hidden: false }, user.id);
    return NextResponse.json({ success: true, slug: made.slug });
  } catch (e) {
    return fail(e);
  }
}

// PUT { slug, ...fields } edits; { slug, hidden } hides or restores.
export async function PUT(request: Request) {
  const { user, denied } = await requireAdminUser();
  if (denied) return denied;
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug : '';
    if (!slug) return fail(new Error('Niche slug required'), 400);
    const data = cleanNicheEdit(body, getBaseNiche(slug)?.rpm);
    const hidden = typeof body.hidden === 'boolean' ? body.hidden : undefined;
    if (!Object.keys(data).length && hidden === undefined) return fail(new Error('Nothing to change'), 400);
    await saveOverride('niche', slug, { data, hidden }, user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return fail(e);
  }
}

// DELETE ?slug= : drop all edits.
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return fail(new Error('Niche slug required'), 400);
  try {
    await resetOverride('niche', slug);
    return NextResponse.json({ success: true });
  } catch (e) {
    return fail(e);
  }
}
