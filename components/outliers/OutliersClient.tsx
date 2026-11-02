'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { VideoOutlierItem } from '@/types';
import {
  Sparkles,
  Search,
  Filter,
  Play,
  RotateCcw,
  TrendingUp,
  User,
  Bot,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';

interface Props {
  initialVideos: VideoOutlierItem[];
  totalVideosCount?: number;
}

const CATEGORIES = [
  'All Niches',
  'History',
  'Crystals & Spirituality',
  'Crime',
  'Animation',
  'Finance',
  'Science',
  'Education',
  'frugal living',
  'stories'
];

export default function OutliersClient({ initialVideos, totalVideosCount = 18086 }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [multiplierFilter, setMultiplierFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [sort, setSort] = useState<'views' | 'multiplier' | 'recent'>('multiplier');
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<VideoOutlierItem[]>(initialVideos);
  const [totalCount, setTotalCount] = useState(totalVideosCount);
  const [loading, setLoading] = useState(false);

  // Sync / query from cached API when filters or page change
  React.useEffect(() => {
    const isDefault = !search && !selectedCategory && !multiplierFilter && !formatFilter && sort === 'multiplier';
    if (isDefault && page === 1) {
      setVideos(initialVideos);
      setTotalCount(totalVideosCount);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: search,
          category: selectedCategory === 'All Niches' ? '' : selectedCategory,
          multiplier: multiplierFilter,
          format: formatFilter,
          sort: sort,
          page: String(page),
          limit: '36'
        });
        const res = await fetch(`/api/outliers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (page === 1) {
            setVideos(data.videos || []);
          } else {
            setVideos((prev) => [...prev, ...(data.videos || [])]);
          }
          setTotalCount(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching outliers:', err);
      } finally {
        setLoading(false);
      }
    }, search ? 250 : 0);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, multiplierFilter, formatFilter, sort, page, initialVideos, totalVideosCount]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMultiplierFilter('');
    setFormatFilter('');
    setSort('multiplier');
    setPage(1);
    setVideos(initialVideos);
    setTotalCount(totalVideosCount);
  };

  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      
      {/* Semantic Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold" aria-current="page">Viral Outliers</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-[var(--border-line)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
          <Flame className="size-3.5 fill-amber-500" />
          The Outlier Vault (18,000+ Blueprints)
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-ink)] tracking-tight mb-3">
          Viral YouTube Outlier Videos
        </h1>
        <p className="text-[15.5px] text-[var(--text-muted)] max-w-3xl leading-relaxed">
          Inspect videos that received <strong>5x to 50x more views</strong> than the channel&apos;s subscriber count. Deconstruct winning thumbnail designs, curiosity gaps, and retention hooks.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border-line)] mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search viral video titles, topics..."
              className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)]"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Niches' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Outlier Multiplier Tier */}
          <select
            value={multiplierFilter}
            onChange={(e) => handleFilterChange(setMultiplierFilter, e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]"
          >
            <option value="">Any Outlier Multiplier</option>
            <option value="5x">🔥 5x+ Views vs Subs</option>
            <option value="10x">🚀 10x+ Super Outliers</option>
            <option value="25x">👑 25x+ Mega Virals</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as any);
              setPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)]"
          >
            <option value="multiplier">Highest Outlier Multiplier</option>
            <option value="views">Most Absolute Views</option>
          </select>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-line)] text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <span>Found <strong className="text-[var(--text-ink)] num-mono">{totalCount.toLocaleString()}</strong> viral outlier videos</span>
            {loading && <span className="text-[var(--brand-mark)] animate-pulse font-medium">Updating...</span>}
          </span>
          {(search || selectedCategory || multiplierFilter || formatFilter) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="size-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 && !loading ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--border-line)]">
          <p className="text-sm text-[var(--text-muted)]">No outlier videos found matching your criteria.</p>
          <button onClick={resetFilters} className="mt-3 text-xs font-semibold text-[var(--brand-mark)] hover:underline">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-[var(--border-line)] hover:border-[var(--brand-accent)]/50 transition-all"
              >
                <div>
                  {/* Thumbnail */}
                  <a
                    href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-video bg-black/40 overflow-hidden block"
                  >
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      width={360}
                      height={202}
                      decoding="async"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Views Pill */}
                    {vid.viewsFormatted && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm">
                        {vid.viewsFormatted}
                      </span>
                    )}

                    {/* Multiplier Badge */}
                    {vid.multiplier && vid.multiplier > 1.5 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-black shadow-md">
                        {vid.multiplier}x Outlier
                      </span>
                    )}

                    {/* Duration Badge */}
                    {vid.durationFormatted && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/85 text-white backdrop-blur-sm">
                        {vid.durationFormatted}
                      </span>
                    )}

                    {/* Play Hover */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="size-4 fill-black text-black ml-0.5" />
                      </div>
                    </div>
                  </a>

                  {/* Body */}
                  <div className="p-4">
                    <a
                      href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[13.5px] text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors line-clamp-2 leading-snug mb-3"
                    >
                      {vid.title}
                    </a>

                    {/* Channel line */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-line)]">
                      <Link
                        href={`/channel/${vid.channelId || vid.channelHandle?.replace('@', '')}`}
                        className="hover:text-[var(--brand-mark)] truncate max-w-[150px] font-medium"
                      >
                        {vid.channelTitle}
                      </Link>
                      <span className="num-mono text-[11px]">{vid.channelSubsFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="p-3 pt-0 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-2)] text-[10.5px] font-medium text-[var(--text-muted)] truncate max-w-[140px]">
                    {vid.category}
                  </span>
                  <a
                    href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1"
                  >
                    Watch <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {videos.length < totalCount && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
                className="btn-accent h-11 px-8 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading More Outliers...' : `Load Next 36 Viral Outliers (${(totalCount - videos.length).toLocaleString()} remaining)`}
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
