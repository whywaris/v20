import fs from 'node:fs';
import path from 'node:path';
import { Metadata } from 'next';
import HomeClient from '@/components/home/HomeClient';
import { Channel } from '@/types';
import { toCardChannel } from '@/lib/card-channel';

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
let nichesCount = 2706;
let videosCount = 18086;

try {
  if (fs.existsSync(channelsPath)) {
    channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  }
  if (fs.existsSync(nichesPath)) {
    const niches = JSON.parse(fs.readFileSync(nichesPath, 'utf8'));
    nichesCount = niches.length;
  }
  if (fs.existsSync(videosPath)) {
    const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    videosCount = videos.length;
  }
} catch (err) {
  console.error('Error reading JSON data files:', err);
}

  const totalChannelsCount = channels.length || 6866;
  const initialChannels: Channel[] = channels.slice(0, 36).map(toCardChannel);

  return {
    channels: initialChannels,
    totalChannelsCount,
    totalNichesCount: nichesCount,
    totalVideosCount: videosCount
  };
}

export default function HomePage() {
  const { channels, totalChannelsCount, totalNichesCount, totalVideosCount } = getInitialData();

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
      />
    </>
  );
}
