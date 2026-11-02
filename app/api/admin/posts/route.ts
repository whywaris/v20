import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/server';
import { DEFAULT_POSTS, POST_COLUMNS, fromRow, validatePostInput, type PostRow } from '@/lib/posts';

// Blog posts live in the Supabase `posts` table, so publishing works on the live site (Vercel can't write files).

function refreshBlog(...slugs: string[]) {
  revalidatePath('/blog');
  for (const s of slugs) revalidatePath(`/blog/${s}`);
  revalidatePath('/blog-sitemap.xml');
  revalidatePath('/sitemap.xml');
}

// GET: every post (drafts included) plus the built-in defaults that haven't been replaced.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await createAdminClient().from('posts').select(POST_COLUMNS).order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const posts = (data as PostRow[]).map(fromRow);
  const taken = new Set(posts.map((p) => p.slug));
  return NextResponse.json({ posts: [...posts, ...DEFAULT_POSTS.filter((p) => !taken.has(p.slug))] });
}

// POST: create or update (send originalSlug when editing, so a changed slug renames the post).
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = validatePostInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const p = parsed.value;

  const db = createAdminClient();
  const { data: existing, error: readError } = await db
    .from('posts')
    .select('slug, published_at')
    .in('slug', [p.slug, ...(p.originalSlug ? [p.originalSlug] : [])]);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const renamed = !!p.originalSlug && p.originalSlug !== p.slug;
  if (renamed && existing.some((r) => r.slug === p.slug)) {
    return NextResponse.json({ error: `Another post already uses the slug "${p.slug}".` }, { status: 409 });
  }
  const previous = existing.find((r) => r.slug === (p.originalSlug ?? p.slug));
  const user = await getUser();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from('posts')
    .upsert(
      {
        slug: p.slug,
        title: p.title,
        description: p.excerpt || null,
        body_md: p.content,
        cover_url: p.coverImage || null,
        category: p.category || null,
        status: p.status,
        // First publish sets the date; later edits keep it.
        published_at: previous?.published_at ?? (p.status === 'published' ? now : null),
        updated_at: now,
        ...(user ? { author_id: user.id } : {}),
      },
      { onConflict: 'slug' }
    )
    .select(POST_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (renamed && previous) await db.from('posts').delete().eq('slug', p.originalSlug!);
  refreshBlog(p.slug, ...(renamed ? [p.originalSlug!] : []));
  return NextResponse.json({ success: true, post: fromRow(data as PostRow) });
}

// DELETE ?slug=...: remove a post. Built-in default posts are part of the code and can only be replaced by editing.
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const slug = new URL(request.url).searchParams.get('slug')?.trim();
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const { data, error } = await createAdminClient().from('posts').delete().eq('slug', slug).select('slug');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data.length) {
    const isDefault = DEFAULT_POSTS.some((p) => p.slug === slug);
    return NextResponse.json(
      { error: isDefault ? 'This is a built-in post. Edit it to replace it instead.' : 'Post not found.' },
      { status: isDefault ? 400 : 404 }
    );
  }
  refreshBlog(slug);
  return NextResponse.json({ success: true });
}
