import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Channel } from '@/types';
import { getChannels } from '@/lib/data';
import { formatNumber, formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowLeft
} from 'lucide-react';

import GatedStats from '@/components/channels/GatedStats';
import MemberInsights from '@/components/channels/MemberInsights';
import { getUser } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ handle: string }>;
}

async function getChannel(slug: string): Promise<Channel | null> {
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  const cleanSlug = decoded.replace(/^@/, '');
  const found = (await getChannels()).find((c) => {
    const cId = (c.id || '').toLowerCase().trim();
    const cHandle = (c.handle || '').toLowerCase().trim().replace(/^@/, '');
    return cId === cleanSlug || cHandle === cleanSlug || cId === decoded || cHandle === decoded;
  });
  return found || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const channel = await getChannel(handle);
  if (!channel) return { title: 'Channel Not Found · YT Niches' };

  const rpmAvg = channel.estimatedRpm?.avg || 7.50;
  const subsFormatted = (channel.subscribers || 0).toLocaleString();
  const formatType = channel.format ? channel.format.toUpperCase() : 'Faceless';

  return {
    title: `${channel.title} YouTube Strategy: RPM ($${rpmAvg}), Views & Growth Breakdown · YT Niches`,
    description: `Analyze ${channel.title} (${channel.handle}): ${subsFormatted} subscribers, estimated $${rpmAvg} RPM, ${formatType} production format, and viral video blueprints.`,
    keywords: [
      `${channel.title} youtube`,
      `${channel.handle}`,
      `${channel.title} estimated earnings`,
      `${channel.title} rpm`,
      'faceless youtube channels',
      'youtube channel analytics',
      'yt niches'
    ],
    alternates: {
      canonical: `https://ytniches.com/channel/${handle}`,
    },
    openGraph: {
      title: `${channel.title} · YouTube Growth & Revenue Analysis`,
      description: `Track ${channel.title} (${subsFormatted} subs) with estimated $${rpmAvg} RPM and viral title patterns.`,
      url: `https://ytniches.com/channel/${handle}`,
      siteName: 'YT Niches',
      images: channel.thumbnail ? [channel.thumbnail] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${channel.title} · YouTube Strategy & RPM Breakdown`,
      description: `Track ${channel.title} analytics, RPM ($${rpmAvg}), and viral content pillars on YT Niches.`,
    }
  };
}

export default async function ChannelDetailPage({ params }: Props) {
  const { handle } = await params;
  const channel = await getChannel(handle);

  if (!channel) {
    notFound();
  }
  const user = await getUser();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      
      {/* 1. Schema.org ProfilePage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            name: channel.title,
            url: `https://ytniches.com/channel/${handle}`,
            mainEntity: {
              '@type': 'Organization',
              name: channel.title,
              url: channel.youtubeUrl,
              image: channel.thumbnail,
            },
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
                name: 'Channels',
                item: 'https://ytniches.com/'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: channel.title,
                item: `https://ytniches.com/channel/${handle}`
              }
            ]
          })
        }}
      />

      {/* Visual Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Channels</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold truncate" aria-current="page">{channel.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--border-line)] mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={channel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=60'}
            alt={channel.title}
            className="size-20 sm:size-24 rounded-2xl object-cover border border-[var(--border-line-strong)] shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)]">
                {channel.title}
              </h1>
              {channel.monetization && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="size-3" /> Monetized
                </span>
              )}
            </div>

            <p className="text-[14px] text-[var(--text-muted)] mb-3">
              {channel.handle} &bull; Estimated RPM: ${channel.estimatedRpm?.avg || 7.50}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {(channel.categories || []).map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--bg-surface-2)] text-[var(--text-muted)] border border-[var(--border-line)]"
                >
                  {cat}
                </span>
              ))}
            </div>

            {channel.youtubeUrl && (
              <a
                href={channel.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-accent inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-semibold shadow-sm"
              >
                Open on YouTube <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>

        {/* Public Snapshot Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--border-line)]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Subscribers</div>
            <div className="text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
              {formatNumber(channel.subscribers)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Avg Views/Video</div>
            <div className="text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
              {formatNumber(channel.avgViews || 0)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Total Views</div>
            <div className="text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
              {formatNumber(channel.totalViews)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Videos Count</div>
            <div className="text-2xl font-bold num-mono text-[var(--text-ink)] mt-1">
              {channel.totalVideos || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Free member insights: signed-in visitors see them, everyone else gets the Google sign-in prompt.
          Rendered on the server, so logged-out HTML never contains the gated data. */}
      {user ? <MemberInsights channel={channel} /> : <GatedStats />}

      {/* Top Videos / Swipe File */}
      {channel.popularVideos && channel.popularVideos.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-ink)] mb-4 flex items-center gap-2">
            <Play className="size-4 text-[var(--brand-mark)]" />
            Top Performing Videos (Outlier Vault)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {channel.popularVideos.map((vid, idx) => (
              <a
                key={idx}
                href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="glass-card rounded-xl overflow-hidden group block"
              >
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="size-5 fill-white text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-[var(--text-ink)] line-clamp-2 leading-snug group-hover:text-[var(--brand-mark)]">
                    {vid.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
