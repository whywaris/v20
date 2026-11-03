import { createClient } from '@supabase/supabase-js';

// Blog posts live in the Supabase `posts` table and are written in /admin/blog.

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  category: string;
  categorySlug: string;
  date: string; // e.g. "Oct 24, 2026"
  publishedAt: string | null; // ISO; in the future = scheduled
  updatedAt: string;
  readTime: string; // e.g. "8 min read"
  coverImage: string;
  status: 'published' | 'draft';
  seoTitle: string;
  seoDescription: string;
};

export const slugifyPost = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export const DEFAULT_CATEGORY = 'Guides';
export const categorySlug = (category: string) => slugifyPost(category) || slugifyPost(DEFAULT_CATEGORY);

export const readTimeFor = (markdown: string) =>
  `${Math.max(1, Math.round(markdown.trim().split(/\s+/).filter(Boolean).length / 200))} min read`;

const formatDate = (iso: string | null) =>
  new Date(iso ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Row shape of the Supabase `posts` table (migrations 0004, 0005, 0007).
export type PostRow = {
  slug: string; title: string; description: string | null; body_md: string; cover_url: string | null;
  status: 'published' | 'draft'; published_at: string | null; category: string | null; updated_at: string;
  seo_title?: string | null; seo_description?: string | null;
};
const BASE_COLUMNS = 'slug, title, description, body_md, cover_url, status, published_at, category, updated_at';
export const POST_COLUMNS = `${BASE_COLUMNS}, seo_title, seo_description`;

export function fromRow(r: PostRow): Post {
  const category = r.category || DEFAULT_CATEGORY;
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.description ?? '',
    content: r.body_md ?? '',
    category,
    categorySlug: categorySlug(category),
    date: formatDate(r.published_at ?? r.updated_at),
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
    readTime: readTimeFor(r.body_md ?? ''),
    coverImage: r.cover_url ?? '',
    status: r.status,
    seoTitle: r.seo_title ?? '',
    seoDescription: r.seo_description ?? '',
  };
}

/** Published and its date has arrived (a future date means scheduled). */
export const isLive = (p: Pick<Post, 'status' | 'publishedAt'>, now = Date.now()) =>
  p.status === 'published' && (!p.publishedAt || Date.parse(p.publishedAt) <= now);

export type PostInput = {
  slug: string; originalSlug: string | null; title: string; excerpt: string; content: string;
  category: string; coverImage: string; status: 'published' | 'draft';
  seoTitle: string; seoDescription: string; publishAt: string | null;
};

/** Validates an admin's post form. Slug defaults to the title; cover image must be an http(s) URL. */
export function validatePostInput(body: unknown): { ok: true; value: PostInput } | { ok: false; error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const str = (k: string) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '');
  const title = str('title');
  if (title.length < 3 || title.length > 160) return { ok: false, error: 'Title must be 3–160 characters.' };
  const slug = slugifyPost(str('slug')) || slugifyPost(title);
  if (!slug) return { ok: false, error: 'Slug must contain letters or numbers.' };
  const excerpt = str('excerpt');
  if (excerpt.length > 300) return { ok: false, error: 'Excerpt must be at most 300 characters.' };
  const content = typeof b.content === 'string' ? b.content : '';
  if (content.trim().length < 50) return { ok: false, error: 'Content must be at least 50 characters.' };
  if (content.length > 100_000) return { ok: false, error: 'Content must be at most 100,000 characters.' };
  const category = str('category').slice(0, 60);
  const coverImage = str('coverImage');
  if (coverImage && (!/^https?:\/\//i.test(coverImage) || coverImage.length > 500)) {
    return { ok: false, error: 'Cover image must be an http(s) URL.' };
  }
  const seoTitle = str('seoTitle');
  if (seoTitle.length > 70) return { ok: false, error: 'SEO title must be at most 70 characters.' };
  const seoDescription = str('seoDescription');
  if (seoDescription.length > 170) return { ok: false, error: 'SEO description must be at most 170 characters.' };
  const publishAtRaw = str('publishAt');
  const publishAt = publishAtRaw && Number.isFinite(Date.parse(publishAtRaw)) ? new Date(publishAtRaw).toISOString() : null;
  if (publishAtRaw && !publishAt) return { ok: false, error: 'Publish date is not a valid date.' };
  const status = b.status === 'draft' ? 'draft' : 'published';
  const original = str('originalSlug');
  return {
    ok: true,
    value: { slug, originalSlug: original || null, title, excerpt, content, category, coverImage, status, seoTitle, seoDescription, publishAt },
  };
}

const newestFirst = (posts: Post[]) =>
  [...posts].sort((a, b) => Date.parse(b.publishedAt ?? b.updatedAt) - Date.parse(a.publishedAt ?? a.updatedAt));

/** Live posts for the public blog, newest first. Never throws (an empty blog on errors). */
export async function getPublishedPosts(): Promise<Post[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const db = createClient(url, key, { auth: { persistSession: false } });
  try {
    // Anonymous client: RLS only returns published posts. Falls back to the older columns if 0007 hasn't run.
    let res: { data: unknown; error: { message: string } | null } = await db.from('posts').select(POST_COLUMNS).eq('status', 'published');
    if (res.error && /seo_/.test(res.error.message)) res = await db.from('posts').select(BASE_COLUMNS).eq('status', 'published');
    if (res.error) throw res.error;
    return newestFirst(((res.data as PostRow[] | null) ?? []).map(fromRow).filter((p) => isLive(p)));
  } catch (e) {
    console.error('posts unavailable:', (e as Error).message);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  return (await getPublishedPosts()).find((p) => p.slug === slug) ?? null;
}

/** Categories that have live posts, with counts, most posts first. */
export function categoriesOf(posts: Post[]) {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of posts) {
    const c = map.get(p.categorySlug) ?? { name: p.category, slug: p.categorySlug, count: 0 };
    c.count++;
    map.set(p.categorySlug, c);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Up to `n` other posts, same category first, then the newest. */
export function relatedPosts(post: Post, all: Post[], n = 3) {
  const others = all.filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.categorySlug === post.categorySlug), ...others.filter((p) => p.categorySlug !== post.categorySlug)].slice(0, n);
}
