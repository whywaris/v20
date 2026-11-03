'use client';

import CatalogManager, { type CatalogConfig } from '@/components/admin/CatalogManager';

type Rpm = { min: number; avg: number; max: number } | undefined;
const rpm = (n: Record<string, unknown>) => n.rpm as Rpm;

const config: CatalogConfig = {
  noun: 'niche',
  api: '/api/admin/niches',
  keyField: 'slug',
  publicPath: (slug) => `/niche/${encodeURIComponent(slug)}`,
  title: (n) => String(n.name ?? ''),
  subtitle: (n) => `/niche/${n.slug}`,
  columns: [
    ['RPM', (n) => (rpm(n) ? `$${rpm(n)!.min}–$${rpm(n)!.max} (avg $${rpm(n)!.avg})` : '—')],
    ['Competition', (n) => String(n.saturation ?? '')],
    ['Demand', (n) => String(n.demandScore ?? '')],
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, get: (n) => n.name, wide: true },
    { name: 'rpmMin', label: 'RPM min ($)', type: 'number', get: (n) => rpm(n)?.min },
    { name: 'rpmAvg', label: 'RPM avg ($)', type: 'number', get: (n) => rpm(n)?.avg },
    { name: 'rpmMax', label: 'RPM max ($)', type: 'number', get: (n) => rpm(n)?.max },
    { name: 'saturation', label: 'Competition', type: 'select', options: ['Low', 'Medium', 'High'], get: (n) => n.saturation },
    { name: 'demandScore', label: 'Demand score (0–10)', type: 'number', get: (n) => n.demandScore },
    { name: 'formatRecommendation', label: 'Recommended format', type: 'text', get: (n) => n.formatRecommendation },
    { name: 'summary', label: 'Summary', type: 'textarea', get: (n) => n.summary },
  ],
};

export default function NichesManager(props: { initialStatus?: string; initialSearch?: string; openNew?: boolean }) {
  return <CatalogManager config={config} {...props} />;
}
