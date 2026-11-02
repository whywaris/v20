import fs from 'node:fs';
import path from 'node:path';
import { Metadata } from 'next';
import OutliersClient from '@/components/outliers/OutliersClient';
import { VideoOutlierItem } from '@/types';

export const metadata: Metadata = {
  title: '20,210+ Viral YouTube Outlier Videos & Breakout Blueprints [2026] · YT Niches',
  description: 'Inspect 20,210+ viral YouTube outlier videos that generated 5x to 50x higher viewership than channel averages. Filter by multiplier, duration, and niche category.',
  keywords: [
    'youtube outlier videos',
    'viral youtube thumbnails',
    'curiosity gap video titles',
    'high ctr youtube video ideas',
    'youtube swipe file',
    'breakout youtube videos',
    'yt niches'
  ],
  alternates: {
    canonical: 'https://ytniches.com/outliers',
  },
  openGraph: {
    title: '20,210+ Viral YouTube Outlier Videos & Breakout Blueprints · YT Niches',
    description: 'Deconstruct 20,210+ viral YouTube outlier videos that generated 5x to 50x higher viewership than channel averages.',
    url: 'https://ytniches.com/outliers',
    siteName: 'YT Niches',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '20,210+ Viral YouTube Outlier Videos · YT Niches',
    description: 'Deconstruct 20,210+ viral outlier video formulas and high-CTR thumbnail blueprints.'
  }
};

function getOutliersData() {
  const filePath = path.join(process.cwd(), 'data', 'unified_outliers.json');
  try {
    if (fs.existsSync(filePath)) {
      const all: VideoOutlierItem[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        totalCount: all.length || 20210,
        initialVideos: all.slice(0, 36)
      };
    }
  } catch (err) {
    console.error('Error reading outliers:', err);
  }
  return { totalCount: 20210, initialVideos: [] };
}

export default function OutliersPage() {
  const { totalCount, initialVideos } = getOutliersData();

  return (
    <>
      {/* 1. Schema.org CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Viral YouTube Outlier Videos Vault',
            description: 'Database of 20,210+ high-CTR YouTube thumbnails and viral titles.',
            url: 'https://ytniches.com/outliers',
            numberOfItems: totalCount,
          }),
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
                name: 'Viral Outliers',
                item: 'https://ytniches.com/outliers'
              }
            ]
          }),
        }}
      />
      
      <OutliersClient initialVideos={initialVideos} totalVideosCount={totalCount} />
    </>
  );
}
