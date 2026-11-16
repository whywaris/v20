import Link from 'next/link';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { PageHeader, cardCls } from '@/components/admin/ui';
import { categoriesOf, getPublishedPosts } from '@/lib/posts';
import { ADSENSE_CLIENT_ID, SITE_URL } from '@/lib/site';

// What search engines see of the blog, and anything that needs fixing.
export default async function AdminSeoPage() {
  const posts = await getPublishedPosts();
  const categories = categoriesOf(posts);
  const noSeo = posts.filter((p) => !p.seoDescription && !p.excerpt);
  const noCover = posts.filter((p) => !p.coverImage);
  const thin = posts.filter((p) => p.content.trim().split(/\s+/).length < 600);

  const env = [
    ['Supabase URL + anon key', !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ['Supabase service role key (admin, uploads)', !!process.env.SUPABASE_SERVICE_ROLE_KEY],
    ['ADMIN_EMAILS', !!process.env.ADMIN_EMAILS?.trim()],
    [`AdSense publisher ID (${ADSENSE_CLIENT_ID})`, !!ADSENSE_CLIENT_ID],
    ['AdSense ad units (leaderboard / in-article)', !!process.env.NEXT_PUBLIC_ADSENSE_SLOT_HORIZONTAL && !!process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE],
  ] as const;

  const links = [
    ['Google Search Console', 'https://search.google.com/search-console'],
    ['Google Analytics', 'https://analytics.google.com/'],
    ['AdSense', 'https://www.google.com/adsense/'],
    ['Vercel', 'https://vercel.com/dashboard'],
    ['Supabase', 'https://supabase.com/dashboard'],
    ['Sitemap index', `${SITE_URL}/sitemap.xml`],
    ['ads.txt', `${SITE_URL}/ads.txt`],
  ] as const;

  const issue = (n: number) => (n ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400');
  const list = (items: typeof posts) =>
    items.length > 0 && (
      <ul className="mt-2 space-y-1 text-[12.5px]">
        {items.slice(0, 8).map((p) => (
          <li key={p.slug}>
            <Link href="/admin/blog" className="text-[var(--text-muted)] hover:text-[var(--brand-mark)]">{p.title}</Link>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader title="SEO & Health" description="What search engines see of the blog, and anything that needs fixing." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${cardCls} p-5`}>
          <h2 className="mb-3 font-bold text-[var(--text-ink)]">Sitemaps</h2>
          <ul className="divide-y divide-[var(--border-line)] text-[13.5px]">
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Articles</span><a href="/blog-sitemap.xml" target="_blank" className="num-mono font-semibold text-[var(--text-ink)] hover:text-[var(--brand-mark)]">{posts.length} URLs</a></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Category pages</span><a href="/blog-sitemap.xml" target="_blank" className="num-mono font-semibold text-[var(--text-ink)] hover:text-[var(--brand-mark)]">{categories.length} URLs</a></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Site pages</span><a href="/pages-sitemap.xml" target="_blank" className="num-mono font-semibold text-[var(--text-ink)] hover:text-[var(--brand-mark)]">view</a></li>
          </ul>
        </section>

        <section className={`${cardCls} p-5`}>
          <h2 className="mb-3 font-bold text-[var(--text-ink)]">Article checks</h2>
          <div className="space-y-4 text-[13.5px]">
            <div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">No meta description or excerpt</span><span className={`num-mono ${issue(noSeo.length)}`}>{noSeo.length}</span></div>
              {list(noSeo)}
            </div>
            <div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">No cover image</span><span className={`num-mono ${issue(noCover.length)}`}>{noCover.length}</span></div>
              {list(noCover)}
            </div>
            <div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Under 600 words (thin content)</span><span className={`num-mono ${issue(thin.length)}`}>{thin.length}</span></div>
              {list(thin)}
            </div>
          </div>
        </section>

        <section className={`${cardCls} p-5 lg:col-span-2`}>
          <h2 className="mb-3 font-bold text-[var(--text-ink)]">Configuration</h2>
          <ul className="space-y-2 text-[13.5px]">
            {env.map(([label, ok]) => (
              <li key={label} className="flex items-center gap-2">
                {ok ? <CheckCircle2 className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-rose-500" />}
                <span className="text-[var(--text-ink)]">{label}</span>
                {!ok && <span className="text-[12px] text-[var(--text-muted)]">not set</span>}
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-5 text-[13px] font-bold text-[var(--text-ink)]">Quick links</h3>
          <div className="flex flex-wrap gap-2">
            {links.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-line)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-accent)]">
                {label} <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
