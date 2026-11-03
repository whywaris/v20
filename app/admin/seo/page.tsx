import Link from 'next/link';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { PageHeader, cardCls, shortDate } from '@/components/admin/ui';
import { overrideCount } from '@/lib/admin-queries';
import { getChannels, getNiches, getOutliers } from '@/lib/data';
import { nicheChannelCounter } from '@/lib/niche-match';
import { getPublishedPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';
import { dataLastmod } from '@/lib/sitemap';

// Server-side health check of what Google sees: sitemap sizes, thin pages, data gaps and missing config.
export default async function AdminSeoPage() {
  const [channels, niches, posts, edits] = await Promise.all([getChannels(), getNiches(), getPublishedPosts(), overrideCount()]);
  const outliers = getOutliers();
  const countChannels = nicheChannelCounter(channels);
  const emptyNiches = niches.filter((n) => countChannels(n) === 0);
  const channelIds = new Set(channels.map((c) => c.id));
  const orphanOutliers = outliers.filter((o) => !o.channelId || !channelIds.has(o.channelId)).length;
  const noThumb = channels.filter((c) => !c.thumbnail).length;

  const sitemaps = [
    ['Niches (indexable)', niches.length - emptyNiches.length, '/niches-sitemap.xml'],
    ['Channels', channels.length, '/channels-sitemap.xml'],
    ['Blog posts', posts.length, '/blog-sitemap.xml'],
  ] as const;

  const env = [
    ['Supabase URL + anon key', !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ['Supabase service role key (admin features)', !!process.env.SUPABASE_SERVICE_ROLE_KEY],
    ['ADMIN_EMAILS', !!process.env.ADMIN_EMAILS?.trim()],
    ['NEXT_PUBLIC_SITE_URL', !!process.env.NEXT_PUBLIC_SITE_URL],
    ['AdSense publisher ID', !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID],
  ] as const;

  const links = [
    ['Google Search Console', 'https://search.google.com/search-console'],
    ['Google Analytics', 'https://analytics.google.com/'],
    ['AdSense', 'https://www.google.com/adsense/'],
    ['Vercel', 'https://vercel.com/dashboard'],
    ['Supabase', 'https://supabase.com/dashboard'],
    ['Sitemap index', `${SITE_URL}/sitemap.xml`],
  ] as const;

  const issue = (n: number) => (n ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400');

  return (
    <>
      <PageHeader title="SEO & Health" description="What search engines see, and anything that needs fixing." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${cardCls} p-5`}>
          <h2 className="mb-3 font-bold text-[var(--text-ink)]">Sitemaps</h2>
          <ul className="divide-y divide-[var(--border-line)] text-[13.5px]">
            {sitemaps.map(([label, n, href]) => (
              <li key={href} className="flex items-center justify-between py-2">
                <span className="text-[var(--text-muted)]">{label}</span>
                <a href={href} target="_blank" className="num-mono font-semibold text-[var(--text-ink)] hover:text-[var(--brand-mark)]">
                  {n.toLocaleString()} URLs
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardCls} p-5`}>
          <h2 className="mb-3 font-bold text-[var(--text-ink)]">Data</h2>
          <ul className="divide-y divide-[var(--border-line)] text-[13.5px]">
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Channels file updated</span><span>{shortDate(dataLastmod('unified_channels.json').toISOString())}</span></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Niches file updated</span><span>{shortDate(dataLastmod('unified_niches.json').toISOString())}</span></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Admin edits (overrides)</span><Link href="/admin/channels?status=edited" className="num-mono hover:text-[var(--brand-mark)]">{edits.value}</Link></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Channels without an avatar</span><span className={`num-mono ${issue(noThumb)}`}>{noThumb}</span></li>
            <li className="flex justify-between py-2"><span className="text-[var(--text-muted)]">Outliers whose channel is missing</span><span className={`num-mono ${issue(orphanOutliers)}`}>{orphanOutliers}</span></li>
          </ul>
        </section>

        <section className={`${cardCls} p-5`}>
          <h2 className="mb-1 font-bold text-[var(--text-ink)]">Thin niche pages <span className={`num-mono ${issue(emptyNiches.length)}`}>({emptyNiches.length})</span></h2>
          <p className="mb-3 text-[13px] text-[var(--text-muted)]">Niches with no matching channels. They are set to noindex and left out of the sitemap. Hide them or add channels.</p>
          <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
            {emptyNiches.slice(0, 120).map((n) => (
              <Link key={n.slug} href={`/admin/niches?q=${encodeURIComponent(n.slug)}`} className="rounded-full border border-[var(--border-line)] px-2.5 py-1 text-[12px] text-[var(--text-ink)] hover:border-[var(--brand-accent)]">
                {n.name}
              </Link>
            ))}
            {emptyNiches.length > 120 && <span className="px-2 py-1 text-[12px] text-[var(--text-muted)]">+{emptyNiches.length - 120} more</span>}
          </div>
        </section>

        <section className={`${cardCls} p-5`}>
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
