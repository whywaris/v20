import Link from 'next/link';
import { Metadata } from 'next';
import { Layers, ArrowRight, DollarSign, Users, Eye } from 'lucide-react';
import { getNiches } from '@/lib/data';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: '2,700+ YouTube Niches Ranked by RPM & Competition [2026] · YT Niches',
  description: 'Explore 2,700+ profitable YouTube niches. Compare benchmark AdSense RPM ($1 - $25+), channel saturation, and view velocity to launch your next channel.',
  keywords: [
    'youtube niches',
    'best youtube niches 2026',
    'high rpm youtube niches',
    'faceless youtube channels',
    'youtube niche competition',
    'youtube category list',
    'yt niches'
  ],
  alternates: {
    canonical: 'https://ytniches.com/niche'
  },
  openGraph: {
    title: '2,700+ YouTube Niches Ranked by RPM & Competition · YT Niches',
    description: 'Compare benchmark AdSense RPM, saturation levels, and top creator blueprints across 2,700+ YouTube niches.',
    url: 'https://ytniches.com/niche',
    siteName: 'YT Niches',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '2,700+ YouTube Niches Ranked by RPM · YT Niches',
    description: 'Explore 2,700+ YouTube niches with benchmark RPM and channel saturation ratings.'
  }
};

export default async function NichesIndexPage() {
  const niches = await getNiches();
  const countFormatted = (niches.length || 2706).toLocaleString();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      
      {/* 1. Schema.org CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'YouTube Niches Master Directory',
            description: 'Comprehensive directory of profitable YouTube niches ranked by RPM and saturation.',
            url: 'https://ytniches.com/niche',
            numberOfItems: niches.length
          })
        }}
      />

      {/* 2. Schema.org BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://ytniches.com/'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Niches',
                item: 'https://ytniches.com/niche'
              }
            ]
          })
        }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold" aria-current="page">Niches</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-[var(--border-line)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3">
          <Layers className="size-3.5" />
          The Niche Master Index
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          All {countFormatted} YouTube Niches &amp; Categories
        </h1>
        <p className="text-[15px] text-[var(--text-muted)] mt-1.5 max-w-2xl">
          Compare channel saturation, estimated AdSense RPM, and average viewership across thousands of sub-niches.
        </p>
      </div>

      {/* Niches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {niches.slice(0, 100).map((niche) => (
          <Link
            key={niche.slug}
            href={`/niche/${niche.slug}`}
            className="glass-card rounded-xl p-4 flex flex-col justify-between group block"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors truncate">
                  {niche.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 shrink-0">
                  ${niche.rpm.avg} RPM
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-3">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="size-3 text-[var(--brand-mark)]" /> {niche.channelCount} channels
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-3" /> {formatNumber(niche.avgViews)} avg views
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[var(--border-line)] flex items-center justify-between text-xs font-semibold text-[var(--brand-mark)]">
              <span>View Niche Hub</span>
              <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
