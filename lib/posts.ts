import { createClient } from '@supabase/supabase-js';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown. Empty for the built-in default posts (they use the template article body).
  category: string;
  date: string; // e.g. "Oct 24, 2026"
  readTime: string; // e.g. "8 min read"
  coverImage: string;
  status: 'published' | 'draft';
  source: 'default' | 'database';
};

/** @deprecated name kept for older imports */
export type BlogPost = Post;

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop&q=60`;
const preset = (p: Omit<Post, 'content' | 'status' | 'source'>): Post => ({ ...p, content: '', status: 'published', source: 'default' });

// Built-in posts, shown until posts with the same slug are written in /admin (which then replace them).
export const DEFAULT_POSTS: Post[] = [
  preset({ slug: 'top-high-rpm-youtube-niches-2026', title: 'Top 10 High RPM YouTube Niches in 2026 (Real Data from 6,800+ Channels)', excerpt: 'An exhaustive analysis of real YouTube AdSense RPM rates across Finance, Tech, History, and Spirituality. See which niches make $15-$25 per thousand views.', category: 'Monetization & RPM', date: 'Oct 24, 2026', readTime: '8 min read', coverImage: img('photo-1551288049-bebda4e38f71') }),
  preset({ slug: 'how-to-build-faceless-history-channel-ai', title: 'How to Build a 100K Subscriber Faceless History Channel Using AI Tools', excerpt: 'Step-by-step case study deconstructing how channels like Chloe VS History and The Crystalier generate millions of views with AI scripts and cinematic visuals.', category: 'Case Studies', date: 'Oct 20, 2026', readTime: '12 min read', coverImage: img('photo-1461360370896-922624d12aa1') }),
  preset({ slug: 'viral-youtube-title-formulas-deconstructed', title: '20 Viral YouTube Title Formulas Deconstructed from 18,000 Outlier Videos', excerpt: 'Stop guessing your video titles. Here are the 20 psychological curiosity-gap formulas responsible for over 500 million views across faceless YouTube channels.', category: 'Title Blueprints', date: 'Oct 15, 2026', readTime: '10 min read', coverImage: img('photo-1618005182384-a83a8bd57fbe') }),
  preset({ slug: 'monetizing-youtube-beyond-adsense-ebooks-funnels', title: 'How Faceless Channels Make $10,000/Month Selling Digital Products on Gumroad', excerpt: 'Why relying solely on AdSense is leaving 80% of your revenue on the table. A breakdown of digital cookbooks, survival guides, and Notion bundles.', category: 'Digital Products', date: 'Oct 10, 2026', readTime: '9 min read', coverImage: img('photo-1553729459-efe14ef6055d') }),
];

export const slugifyPost = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export const readTimeFor = (markdown: string) =>
  `${Math.max(1, Math.round(markdown.trim().split(/\s+/).filter(Boolean).length / 200))} min read`;

const formatDate = (iso: string | null) =>
  new Date(iso ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Row shape of the Supabase `posts` table (see supabase/migrations/0004 and 0005).
export type PostRow = {
  slug: string; title: string; description: string | null; body_md: string; cover_url: string | null;
  status: 'published' | 'draft'; published_at: string | null; category: string | null; updated_at: string;
};
export const POST_COLUMNS = 'slug, title, description, body_md, cover_url, status, published_at, category, updated_at';

export function fromRow(r: PostRow): Post {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.description ?? '',
    content: r.body_md ?? '',
    category: r.category || 'Guides',
    date: formatDate(r.published_at ?? r.updated_at),
    readTime: readTimeFor(r.body_md ?? ''),
    coverImage: r.cover_url ?? '',
    status: r.status,
    source: 'database',
  };
}

export type PostInput = {
  slug: string; originalSlug: string | null; title: string; excerpt: string; content: string;
  category: string; coverImage: string; status: 'published' | 'draft';
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
  const status = b.status === 'draft' ? 'draft' : 'published';
  const original = str('originalSlug');
  return { ok: true, value: { slug, originalSlug: original || null, title, excerpt, content, category, coverImage, status } };
}

const sortByDate =(posts: Post[]) => [...posts].sort((a, b) => Date.parse(`${b.date} UTC`) - Date.parse(`${a.date} UTC`));

/** Published posts for the public blog: database posts, plus defaults whose slug isn't taken. Never throws. */
export async function getPublishedPosts(): Promise<Post[]> {
  let rows: PostRow[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      // Anonymous client: RLS only returns published posts.
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { data, error } = await db.from('posts').select(POST_COLUMNS).eq('status', 'published');
      if (error) console.error('posts: falling back to defaults:', error.message);
      rows = (data as PostRow[] | null) ?? [];
    } catch (e) {
      console.error('posts: falling back to defaults:', e);
    }
  }
  const fromDb = rows.map(fromRow);
  const taken = new Set(fromDb.map((p) => p.slug));
  return sortByDate([...fromDb, ...DEFAULT_POSTS.filter((p) => !taken.has(p.slug))]);
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  return (await getPublishedPosts()).find((p) => p.slug === slug) ?? null;
}
