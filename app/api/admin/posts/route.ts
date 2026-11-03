import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/server';
import { POST_COLUMNS, categorySlug, fromRow, validatePostInput, type PostRow } from '@/lib/posts';

// Blog posts live in the Supabase `posts` table, so publishing works on the live site (Vercel can't write files).

function refreshBlog(...slugs: string[]) {
  revalidatePath('/blog', 'layout'); // the list, every article and category page
  for (const s of slugs) revalidatePath(`/blog/${s}`);
  revalidatePath('/blog-sitemap.xml');
  revalidatePath('/sitemap.xml');
}

const friendly = (message: string) =>
  /seo_(title|description)/.test(message) ? 'Run supabase/migrations/0007_blog.sql in Supabase first (SEO columns are missing).' : message;

// GET: every post, drafts and scheduled included, most recently edited first.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await createAdminClient().from('posts').select(POST_COLUMNS).order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 500 });
  return NextResponse.json({ posts: (data as PostRow[]).map(fromRow) });
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
    .select('slug, published_at, category')
    .in('slug', [p.slug, ...(p.originalSlug ? [p.originalSlug] : [])]);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const renamed = !!p.originalSlug && p.originalSlug !== p.slug;
  if (renamed && existing.some((r) => r.slug === p.slug)) {
    return NextResponse.json({ error: `Another post already uses the slug "${p.slug}".` }, { status: 409 });
  }
  if (!p.originalSlug && existing.some((r) => r.slug === p.slug)) {
    return NextResponse.json({ error: `A post with the slug "${p.slug}" already exists. Change the slug or edit that post.` }, { status: 409 });
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
        seo_title: p.seoTitle || null,
        seo_description: p.seoDescription || null,
        status: p.status,
        // A chosen date wins (future = scheduled); otherwise the first publish sets it and later edits keep it.
        published_at: p.publishAt ?? previous?.published_at ?? (p.status === 'published' ? now : null),
        updated_at: now,
        ...(user ? { author_id: user.id } : {}),
      },
      { onConflict: 'slug' }
    )
    .select(POST_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 500 });

  if (renamed && previous) await db.from('posts').delete().eq('slug', p.originalSlug!);
  refreshBlog(p.slug, ...(renamed ? [p.originalSlug!] : []), `category/${categorySlug(p.category || 'Guides')}`);
  return NextResponse.json({ success: true, post: fromRow(data as PostRow) });
}

// DELETE ?slug=...: remove a post.
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const slug = new URL(request.url).searchParams.get('slug')?.trim();
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const { data, error } = await createAdminClient().from('posts').delete().eq('slug', slug).select('slug, category');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data.length) return NextResponse.json({ error: 'Post not found. It may already be deleted.' }, { status: 404 });
  refreshBlog(slug, `category/${categorySlug(data[0].category || 'Guides')}`);
  return NextResponse.json({ success: true });
}
