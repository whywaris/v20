'use client';

import CatalogManager, { type CatalogConfig } from '@/components/admin/CatalogManager';
import { formatNumber } from '@/lib/utils';

const config: CatalogConfig = {
  noun: 'channel',
  api: '/api/admin/channels',
  keyField: 'id',
  publicPath: (id) => `/channel/${encodeURIComponent(id)}`,
  title: (c) => String(c.title ?? ''),
  subtitle: (c) => `${c.handle ?? ''} · ${((c.categories as string[]) ?? []).slice(0, 2).join(', ')}`,
  image: (c) => (c.thumbnail as string) || null,
  columns: [
    ['Subs', (c) => formatNumber(c.subscribers as number)],
    ['Avg views', (c) => formatNumber(c.avgViews as number)],
    ['Format', (c) => String(c.format ?? '')],
    ['Monetized', (c) => (c.monetization ? 'Yes' : 'No')],
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, get: (c) => c.title, wide: true },
    { name: 'handle', label: 'Handle', type: 'text', required: true, placeholder: '@handle', get: (c) => c.handle },
    { name: 'format', label: 'Format', type: 'select', options: ['faceless', 'avatar', 'documentary'], get: (c) => c.format },
    { name: 'subscribers', label: 'Subscribers', type: 'number', get: (c) => c.subscribers },
    { name: 'avgViews', label: 'Avg views / video', type: 'number', get: (c) => c.avgViews },
    { name: 'estimatedMonthlyRevenueUsd', label: 'Est. monthly revenue ($)', type: 'number', get: (c) => c.estimatedMonthlyRevenueUsd },
    { name: 'categories', label: 'Categories (comma separated)', type: 'text', get: (c) => ((c.categories as string[]) ?? []).join(', ') },
    { name: 'youtubeUrl', label: 'YouTube URL', type: 'text', placeholder: 'https://www.youtube.com/@…', get: (c) => c.youtubeUrl, wide: true },
    { name: 'thumbnail', label: 'Avatar image URL', type: 'text', placeholder: 'https://…', get: (c) => c.thumbnail, wide: true },
    { name: 'monetization', label: 'Monetized with YouTube ads', type: 'checkbox', get: (c) => c.monetization },
  ],
};

export default function ChannelsManager(props: { initialStatus?: string; initialSearch?: string; openNew?: boolean; prefill?: Record<string, string> }) {
  return <CatalogManager config={config} {...props} />;
}
