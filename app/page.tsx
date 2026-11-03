import fs from 'node:fs';
import path from 'node:path';
import { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { Channel, Niche, VideoOutlierItem } from '@/types';
import { toCardChannel } from '@/lib/card-channel';
import { matchChannels } from '@/lib/niche-match';
import { outlierRatio } from '@/lib/mcp';
import type { BentoNiche } from '@/components/home/TopNichesBento';
import type { SpotlightVideo } from '@/components/home/OutlierSpotlight';
import type { RpmPreset } from '@/components/home/HomeRevenueSimulator';

export const metadata: Metadata = {
  title: 'YT Niches · Find Profitable YouTube Niches, AI Avatars & 18,000+ Outliers [2026]',
  description: 'Discover high-RPM YouTube niches, 6,800+ low-competition faceless & AI avatar channels (under 250k subs), and 18,000+ viral outlier video formulas. Find proven channel ideas before you produce.',
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
    title: 'YT Niches · Find Profitable YouTube Niches & Viral Outliers [2026]',
    description: 'Explore 6,800+ low-competition YouTube channels (under 250k subs) across 2,700+ niches with benchmark RPM ($1 - $25+), revenue analytics, and 18,000+ viral video blueprints.',
    url: 'https://ytniches.com/',
    siteName: 'YT Niches',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YT Niches · Find Profitable YouTube Niches & Viral Outliers',
    description: 'Explore 6,800+ low-competition channels and 2,700+ niches with benchmark RPM, AI avatar formats, and viral outlier formulas.'
  }
};

  function getInitialData() {
    const dataDir = path.join(process.cwd(), 'data');
const channelsPath = path.join(dataDir, 'unified_channels.json');
const nichesPath = path.join(dataDir, 'unified_niches.json');
const videosPath = path.join(dataDir, 'unified_outliers.json');

let channels: Channel[] = [];
let niches: Niche[] = [];
let outliers: VideoOutlierItem[] = [];
let nichesCount = 2706;
let videosCount = 18086;

try {
  if (fs.existsSync(channelsPath)) {
    channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  }
  if (fs.existsSync(nichesPath)) {
    niches = JSON.parse(fs.readFileSync(nichesPath, 'utf8'));
    nichesCount = niches.length;
  }
  if (fs.existsSync(videosPath)) {
    outliers = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    videosCount = outliers.length;
  }
} catch (err) {
  console.error('Error reading JSON data files:', err);
}

  const totalChannelsCount = channels.length || 6866;
  const initialChannels: Channel[] = channels.slice(0, 12).map(toCardChannel);

  return {
    channels: initialChannels,
    totalChannelsCount,
    totalNichesCount: nichesCount,
    totalVideosCount: videosCount,
    bento: bentoNiches(channels, niches),
    spotlight: spotlightOutliers(channels, outliers),
    presets: simulatorPresets(niches)
  };
}

// Real niches from the data, biggest RPM first in the grid. There is no "AI documentaries" niche, so Documentary stands in.
const BENTO_SLUGS = ['finance', 'documentary', 'true-crime', 'tech', 'science', 'history'];

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
      rpmMax: n.rpm?.max ?? 0,
      channelCount: matched.length,
      avatars: matched.filter((c) => c.thumbnail).slice(0, 3).map((c) => ({ title: c.title, thumbnail: c.thumbnail! })),
    }];
  });
}

function spotlightOutliers(channels: Channel[], outliers: VideoOutlierItem[]): SpotlightVideo[] {
  const byId = new Map(channels.map((c) => [c.id, c]));
  const seen = new Set<string>();
  return outliers
    .flatMap((o) => {
      const c = o.channelId ? byId.get(o.channelId) : undefined;
      const x = outlierRatio(o, c);
      return c && o.thumbnail && x != null && x >= 5 && x <= 10 ? [{ o, c, x }] : [];
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

// Revenue simulator presets use each niche's benchmark average RPM, so they match the bento and niche pages.
const SIMULATOR_SLUGS = ['finance', 'tech', 'true-crime', 'history', 'gaming'];

function simulatorPresets(niches: Niche[]): RpmPreset[] {
  return SIMULATOR_SLUGS.flatMap((slug) => {
    const n = niches.find((x) => x.slug === slug);
    return n?.rpm?.avg ? [{ name: n.name, category: n.name, rpm: n.rpm.avg }] : [];
  });
}

export default function HomePage() {
  const { channels, totalChannelsCount, totalNichesCount, totalVideosCount, bento, spotlight, presets } = getInitialData();

  return (
    <>
      {/* 1. Schema.org WebSite with SearchAction (Google Sitelinks Search Box) */}
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
                urlTemplate: 'https://ytniches.com/?q={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />

      {/* 2. Schema.org CollectionPage Structured Data for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'YouTube Channels & Viral Niches Library',
            description: 'Directory of YouTube channels, estimated revenue, RPM, and video swipe files.',
            url: 'https://ytniches.com/',
            numberOfItems: totalChannelsCount
          })
        }}
      />

      <HomeClient
        initialChannels={channels}
        totalChannelsCount={totalChannelsCount}
        totalNichesCount={totalNichesCount}
        totalVideosCount={totalVideosCount}
        bento={bento}
        spotlight={spotlight}
        presets={presets}
      />
    </>
  );
}
