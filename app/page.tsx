import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import HeroBanner, { SearchForm } from '@/components/home/HeroBanner';
import TopNichesBento, { type BentoNiche } from '@/components/home/TopNichesBento';
import OutlierSpotlight, { type SpotlightVideo } from '@/components/home/OutlierSpotlight';
import ChannelCard from '@/components/channels/ChannelCard';
import { Channel, Niche, VideoOutlierItem } from '@/types';
import { toCardChannel } from '@/lib/card-channel';
import { matchChannels } from '@/lib/niche-match';
import { outlierRatio } from '@/lib/mcp';
import { getChannels, getNiches, getOutliers } from '@/lib/data';

const TITLE = 'YT Niches - Find Most Profitable YouTube Niches';
const DESCRIPTION =
  'Discover the top faceless YouTube niches. Explore low-competition, trending, and highest-paying YouTube niches, plus beginner-friendly channel ideas to grow your success.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'youtube niches',
    'profitable youtube niches 2026',
    'faceless youtube channel ideas',
    'ai avatar youtube channels',
    'youtube outlier videos',
    'youtube rpm rates',
    'youtube monetization benchmarks',
    'yt niches'
  ],
  alternates: {
    canonical: 'https://ytniches.com/'
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://ytniches.com/',
    siteName: 'YT Niches',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION
  }
};

// Picked from the data for a spread of RPM and competition (each has 20+ matched channels).
const BENTO_SLUGS = ['finance', 'business', 'software', 'repair', 'true-crime', 'war-history'];

function bentoNiches(channels: Channel[], niches: Niche[]): BentoNiche[] {
  return BENTO_SLUGS.flatMap((slug) => {
    const n = niches.find((x) => x.slug === slug);
    if (!n) return [];
    const matched = matchChannels(n, channels).all;
    if (!matched.length) return [];
    return [{
      name: n.name,
      slug: n.slug,
      rpmMin: n.rpm?.min ?? 0,
      rpmAvg: n.rpm?.avg ?? 0,
      rpmMax: n.rpm?.max ?? 0,
      saturation: n.saturation,
      channelCount: matched.length,
      avatars: matched.slice(0, 3).map((c) => ({ title: c.title, thumbnail: c.thumbnail ?? null })),
    }];
  });
}

// Compilation / re-upload channels make weak examples of a breakout, so they're left out of the showcase.
const NOT_SHOWCASE = /viral videos|compilation|official/i;

function spotlightOutliers(channels: Channel[], outliers: VideoOutlierItem[]): SpotlightVideo[] {
  const byId = new Map(channels.map((c) => [c.id, c]));
  const seen = new Set<string>();
  return outliers
    .flatMap((o) => {
      const c = o.channelId ? byId.get(o.channelId) : undefined;
      const x = outlierRatio(o, c);
      return c && o.thumbnail && !NOT_SHOWCASE.test(c.title) && x != null && x >= 5 && x <= 10 ? [{ o, c, x }] : [];
    })
    .sort((a, b) => b.o.views - a.o.views)
    .filter(({ c }) => !seen.has(c.id) && Boolean(seen.add(c.id)))
    .slice(0, 3)
    .map(({ o, c, x }) => ({
      title: o.title,
      thumbnail: o.thumbnail,
      videoUrl: o.videoUrl || `https://www.youtube.com/watch?v=${o.videoId}`,
      views: o.views,
      channelAvgViews: c.avgViews,
      times: Math.round(x * 10) / 10,
      channelTitle: c.title,
      channelSlug: c.slug || c.id,
      channelThumbnail: c.thumbnail ?? null,
      channelSubs: c.subscribers,
    }));
}

export default async function HomePage() {
  const [channels, niches] = await Promise.all([getChannels(), getNiches()]);
  const outliers = getOutliers();

  return (
    <>
      {/* Schema.org WebSite with SearchAction (Google Sitelinks Search Box) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'YT Niches',
            alternateName: ['YTNiches', 'YT Niches Hub'],
            url: 'https://ytniches.com/',
            description: 'Directory of 6,800+ low-competition YouTube channels (under 250k subs) across 2,700+ niches with estimated RPM, revenue analytics, and viral video swipe files.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://ytniches.com/channels?q={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HeroBanner
          totalChannelsCount={channels.length}
          totalNichesCount={niches.length}
          totalVideosCount={outliers.length}
        />

        <TopNichesBento niches={bentoNiches(channels, niches)} totalNichesCount={niches.length} />

        <OutlierSpotlight videos={spotlightOutliers(channels, outliers)} />

        <section className="py-12" aria-labelledby="channels-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="channels-title" className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">
                Small channels worth studying
              </h2>
              <p className="mt-1 text-[15px] text-[var(--text-muted)]">Every channel in the directory is under 250k subscribers.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {channels.slice(0, 6).map((c) => (
              <ChannelCard key={c.id} channel={toCardChannel(c)} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/channels" className="btn-accent inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px]">
              Browse all {channels.length.toLocaleString()} channels <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="my-12 rounded-3xl border border-[var(--border-line)] bg-[var(--bg-surface)] px-5 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-4xl">Start with a niche</h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-[var(--text-muted)]">
            Search any topic to see the small channels already earning from it.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchForm size="md" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-[14px] font-semibold">
            <Link href="/channels" className="rounded-full border border-[var(--border-line-strong)] px-5 py-2.5 text-[var(--text-ink)] hover:border-[var(--brand-accent)]">
              Browse channels
            </Link>
            <Link href="/niche" className="rounded-full border border-[var(--border-line-strong)] px-5 py-2.5 text-[var(--text-ink)] hover:border-[var(--brand-accent)]">
              Explore niches
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
