'use client';

import React from 'react';
import Link from 'next/link';
import { Channel } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { DollarSign, CheckCircle2, Play, Sparkles, User, Bot, Film, ShoppingBag } from 'lucide-react';

const OFFER_LABEL: Record<string, string> = {
  ebook: 'Sells Ebook',
  guide: 'Sells Guide',
  cookbook: 'Sells Cookbook',
  bundle: 'Sells Bundle',
  membership: 'Sells Membership',
  lead_magnet: 'Free Lead Magnet',
  other: 'Sells Digital Product',
};

// What the channel sells, preferring a paid product over a free lead magnet.
function monetizationBadge(channel: Channel): string | null {
  const types = (channel.offers ?? []).map((o) => o.type);
  const paid = types.find((t) => t !== 'lead_magnet');
  if (paid) return OFFER_LABEL[paid] ?? 'Sells Digital Product';
  if (types.length) return OFFER_LABEL.lead_magnet;
  return channel.sells === 'yes' ? 'Sells Digital Product' : null;
}

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const channelSlug = channel.slug || channel.id || channel.handle.replace('@', '');
  const topVideos = (channel.popularVideos || []).slice(0, 3);
  const isAvatar = channel.format === 'avatar' || Boolean(channel.avatarStyle);
  const sellsBadge = monetizationBadge(channel);
  // Per-video durations in the data are the channel's median length copied onto every video, so show it once.
  const typicalMinutes = channel.medianLengthSeconds ? Math.max(1, Math.round(channel.medianLengthSeconds / 60)) : null;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-[var(--brand-accent)]/40 hover:-translate-y-0.5">
      
      {/* Top Section: Avatar, Title, Badges */}
      <div>
        <div className="flex items-start gap-3.5">
          <Link href={`/channel/${channelSlug}`} className="shrink-0 relative group/avatar block size-13">
            <img
              src={channel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60'}
              alt={channel.title}
              width={52}
              height={52}
              decoding="async"
              className="size-13 rounded-xl object-cover border border-[var(--border-line-strong)] shadow-sm group-hover/avatar:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60';
              }}
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/channel/${channelSlug}`}
                className="font-bold text-[15px] text-[var(--text-ink)] hover:text-[var(--brand-mark)] transition-colors truncate block"
              >
                {channel.title}
              </Link>
              
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] mt-0.5">
              <span className="truncate">{channel.handle}</span>
            </div>

            {/* Format & Style Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {isAvatar ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Bot className="size-3" /> AI Avatar
                </span>
              ) : channel.format === 'documentary' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Film className="size-3" /> Documentary
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <User className="size-3" /> Faceless
                </span>
              )}

              {/* Monetization status */}
              {sellsBadge ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <ShoppingBag className="size-3" /> {sellsBadge}
                </span>
              ) : null}

              {(channel.categories || []).slice(0, 1).map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/niche/${encodeURIComponent(cat.toLowerCase().replace(/[\s_]+/g, '-'))}`}
                  className="px-2 py-0.5 text-[10.5px] font-medium rounded-md bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--brand-mark)] border border-[var(--border-line)] truncate max-w-[150px]"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 px-3 rounded-xl bg-[var(--bg-surface-2)]/60 border border-[var(--border-line)]">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Subs</div>
            <div className="num-mono font-bold text-[13.5px] text-[var(--text-ink)] mt-0.5">
              {formatNumber(channel.subscribers)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Avg Views</div>
            <div className="num-mono font-bold text-[13.5px] text-[var(--text-ink)] mt-0.5">
              {formatNumber(channel.avgViews || 0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Est. Revenue</div>
            <div className="num-mono font-bold text-[13.5px] text-emerald-500 flex items-center gap-0.5 mt-0.5">
              {channel.estimatedMonthlyRevenueUsd ? (
                <>
                  <span>{formatCurrency(channel.estimatedMonthlyRevenueUsd)}</span>
                  <span className="text-[9.5px] text-[var(--text-muted)]">/mo</span>
                </>
              ) : (
                <span className="text-[11px] font-medium text-[var(--text-muted)]" title="No revenue estimate for this channel yet">
                  Not estimated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Outlier Videos Preview with views pills */}
        {topVideos.length > 0 && (
          <div className="mt-3.5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-[var(--brand-mark)]" /> Viral Outlier Videos
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Top 3{typicalMinutes ? ` · ~${typicalMinutes} min videos` : ''}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {topVideos.map((vid, i) => (
                <a
                  key={i}
                  href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  title={vid.title}
                  className="group/thumb relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--border-line)] block"
                >
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    width={120}
                    height={68}
                    decoding="async"
                    className="size-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  
                  {/* Views Pill (Top Left) */}
                  {vid.viewsFormatted && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/75 text-white backdrop-blur-sm shadow-sm pointer-events-none">
                      {vid.viewsFormatted.replace(' views', '')}
                    </span>
                  )}

                  {/* Play Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="size-6 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md">
                      <Play className="size-3 fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA & Footer Details */}
      <div className="mt-4 pt-3 border-t border-[var(--border-line)] flex items-center justify-between">
        <span className="text-[11.5px] text-[var(--text-muted)] font-medium">
          Est. RPM: <strong className="text-emerald-500">${channel.estimatedRpm?.avg || 8.5}</strong>
        </span>

        <Link
          href={`/channel/${channelSlug}`}
          className="text-[12px] font-bold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1 group/btn"
        >
          Deep Breakdown <span className="group-hover/btn:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>

    </div>
  );
}
