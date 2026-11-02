'use client';

import React from 'react';
import Link from 'next/link';
import { Channel } from '@/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { CheckCircle2, Bot, User, ArrowRight } from 'lucide-react';

interface Props {
  channel: Channel;
}

export default function ChannelTableRow({ channel }: Props) {
  const channelSlug = channel.slug || channel.id || channel.handle.replace('@', '');
  const isAvatar = channel.format === 'avatar' || Boolean(channel.avatarStyle);

  return (
    <tr className="border-b border-[var(--border-line)] hover:bg-[var(--bg-surface-2)]/50 transition-colors">
      {/* Channel info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={channel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60'}
            alt={channel.title}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="size-10 rounded-lg object-cover border border-[var(--border-line)] shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60';
            }}
          />
          <div className="min-w-0">
            <Link
              href={`/channel/${channelSlug}`}
              className="font-bold text-sm text-[var(--text-ink)] hover:text-[var(--brand-mark)] transition-colors truncate block"
            >
              {channel.title}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span>{channel.handle}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Primary Niche */}
      <td className="py-3 px-3 text-xs text-[var(--text-muted)] max-w-[140px] truncate">
        {channel.categories?.[0] || 'General'}
      </td>

      {/* Subscribers */}
      <td className="py-3 px-3 num-mono text-sm font-bold text-[var(--text-ink)]">
        {formatNumber(channel.subscribers)}
      </td>

      {/* Avg Views */}
      <td className="py-3 px-3 num-mono text-sm text-[var(--text-muted)]">
        {formatNumber(channel.avgViews || 0)}
      </td>

      {/* Est. RPM */}
      <td className="py-3 px-3 num-mono text-xs font-semibold text-emerald-500">
        ${channel.estimatedRpm?.avg || 8.5}
      </td>

      {/* Est. Monthly Revenue */}
      <td className="py-3 px-3 num-mono text-sm font-bold text-emerald-500">
        {channel.estimatedMonthlyRevenueUsd ? (
          formatCurrency(channel.estimatedMonthlyRevenueUsd)
        ) : (
          <span className="text-xs text-[var(--text-muted)] font-normal" title="No revenue estimate for this channel yet">
            Not estimated
          </span>
        )}
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right">
        <Link
          href={`/channel/${channelSlug}`}
          className="btn-accent h-7 px-3 text-xs rounded-full font-semibold inline-flex items-center gap-1"
        >
          View <ArrowRight className="size-3" />
        </Link>
      </td>
    </tr>
  );
}
