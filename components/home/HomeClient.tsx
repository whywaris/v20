'use client';

import React, { useState } from 'react';
import { Channel } from '@/types';
import ChannelCard from '@/components/channels/ChannelCard';
import ChannelTableRow from '@/components/channels/ChannelTableRow';
import FilterSidebar from '@/components/filters/FilterSidebar';
import AdSlot from '@/components/ads/AdSlot';
import HeroBanner from '@/components/home/HeroBanner';
import TopNichesBento, { type BentoNiche } from '@/components/home/TopNichesBento';
import OutlierSpotlight, { type SpotlightVideo } from '@/components/home/OutlierSpotlight';
import HomeRevenueSimulator, { type RpmPreset } from '@/components/home/HomeRevenueSimulator';
import CreatorToolkit from '@/components/home/CreatorToolkit';
import { ArrowRight, Mail, LayoutGrid, List } from 'lucide-react';

interface HomeClientProps {
  initialChannels: Channel[];
  totalChannelsCount: number;
  totalNichesCount: number;
  totalVideosCount: number;
  bento: BentoNiche[];
  spotlight: SpotlightVideo[];
  presets: RpmPreset[];
}

const CATEGORY_CHIPS = [
  { label: 'All Categories', value: '' },
  { label: '🤖 AI Avatar', value: 'format:avatar' },
  { label: '👤 Faceless', value: 'format:faceless' },
  { label: '📜 History', value: 'History' },
  { label: '🔮 Crystals & Spirituality', value: 'Crystals & Spirituality' },
  { label: '🕵️ True Crime', value: 'Crime' },
  { label: '🎬 Animation', value: 'Animation' },
  { label: '💰 Finance & Money', value: 'Finance' },
  { label: '🚀 Science & Space', value: 'Science' },
  { label: '🏡 Frugal & Homestead', value: 'frugal living' },
  { label: '🧠 Education & Tech', value: 'Education' },
];

const HERO_PILLS = CATEGORY_CHIPS.filter((c) => ['format:avatar', 'format:faceless', 'Finance', 'Crime', 'History', 'Science'].includes(c.value));

const PAGE_SIZE = 12; // must match the initial slice in app/page.tsx

const AD_EVERY = 12; // one in-feed ad after every 12th channel card / table row

export default function HomeClient({
  initialChannels,
  totalChannelsCount,
  totalNichesCount,
  totalVideosCount,
  bento,
  spotlight,
  presets
}: HomeClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [monetizedFilter, setMonetizedFilter] = useState('');
  const [sort, setSort] = useState('subscribers');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [totalCount, setTotalCount] = useState(totalChannelsCount);
  const [loading, setLoading] = useState(false);

  // Quick chip click handler
  const handleChipClick = (val: string) => {
    if (val === 'format:avatar') {
      setFormatFilter('avatar');
      setSelectedCategory('');
    } else if (val === 'format:faceless') {
      setFormatFilter('faceless');
      setSelectedCategory('');
    } else {
      setSelectedCategory(val);
      setFormatFilter('');
    }
    setPage(1);
  };

  const isChipActive = (val: string) =>
    (val === '' && !selectedCategory && !formatFilter) ||
    (val === 'format:avatar' && formatFilter === 'avatar') ||
    (val === 'format:faceless' && formatFilter === 'faceless') ||
    (val !== '' && val === selectedCategory);

  // Sync with API when filters, search, sort or page change
  React.useEffect(() => {
    const isDefault = !search && !selectedCategory && !subFilter && !formatFilter && !monetizedFilter && sort === 'subscribers';
    if (isDefault && page === 1) {
      setChannels(initialChannels);
      setTotalCount(totalChannelsCount);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: search,
          category: selectedCategory,
          format: formatFilter,
          subscribers: subFilter,
          monetized: monetizedFilter,
          sort: sort,
          page: String(page),
          limit: String(PAGE_SIZE)
        });
        const res = await fetch(`/api/channels?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (page === 1) {
            setChannels(data.channels || []);
          } else {
            setChannels((prev) => [...prev, ...(data.channels || [])]);
          }
          setTotalCount(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    }, search ? 250 : 0);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, subFilter, formatFilter, monetizedFilter, sort, page, initialChannels, totalChannelsCount]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSubFilter('');
    setFormatFilter('');
    setMonetizedFilter('');
    setSort('subscribers');
    setPage(1);
    setChannels(initialChannels);
    setTotalCount(totalChannelsCount);
  };

  const handleFilterSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleFilterCategory = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };
  const handleFilterSub = (val: string) => {
    setSubFilter(val);
    setPage(1);
  };
  const handleFilterFormat = (val: string) => {
    setFormatFilter(val);
    setPage(1);
  };
  const handleFilterMonetized = (val: string) => {
    setMonetizedFilter(val);
    setPage(1);
  };
  const handleFilterSort = (val: string) => {
    setSort(val);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      
      <HeroBanner
        search={search}
        onSearch={handleFilterSearch}
        pills={HERO_PILLS}
        activePill={isChipActive}
        onPill={handleChipClick}
        totalChannelsCount={totalChannelsCount}
        totalNichesCount={totalNichesCount}
        totalVideosCount={totalVideosCount}
      />

      <TopNichesBento niches={bento} />

      <OutlierSpotlight videos={spotlight} />

      <HomeRevenueSimulator presets={presets} onPick={handleChipClick} />

      <div id="directory" className="scroll-mt-20 mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">Channel Directory</h2>
        <p className="mt-1 text-[14px] text-[var(--text-muted)]">Filter instantly by niche, format, size and monetization.</p>
      </div>

      {/* Horizontal Category Chips Bar (AvatarChannels style) */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = isChipActive(chip.value);

          return (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-[var(--brand-accent)] text-white border-[var(--brand-accent)] shadow-sm'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border-[var(--border-line)] hover:border-[var(--brand-accent)]/50'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Sticky Sidebar + Main Directory */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sticky Filter Sidebar */}
        <FilterSidebar
          search={search}
          setSearch={handleFilterSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleFilterCategory}
          subFilter={subFilter}
          setSubFilter={handleFilterSub}
          formatFilter={formatFilter}
          setFormatFilter={handleFilterFormat}
          monetizedFilter={monetizedFilter}
          setMonetizedFilter={handleFilterMonetized}
          sort={sort}
          setSort={handleFilterSort}
          totalResults={totalCount}
          onReset={resetFilters}
        />

        {/* Channels Grid / Table */}
        <div className="flex-1 min-w-0 w-full">
          
          {/* Controls Bar above results */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-[var(--border-line)] gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--text-ink)]">
                {totalCount.toLocaleString()} Channels Found
              </span>
              {loading && (
                <span className="text-xs font-semibold text-[var(--brand-mark)] animate-pulse">
                  Updating...
                </span>
              )}
              {(formatFilter || selectedCategory || subFilter || monetizedFilter) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[var(--brand-mark)] hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* View Mode Switcher & Quick Sort */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)]">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[var(--bg-surface)] text-[var(--brand-mark)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                  }`}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === 'table'
                      ? 'bg-[var(--bg-surface)] text-[var(--brand-mark)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                  }`}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard ad above the directory */}
          <AdSlot format="horizontal" className="mb-6" />

          {/* Results Render */}
          {channels.length === 0 && !loading ? (
            <div className="glass rounded-2xl p-12 text-center border border-[var(--border-line)]">
              <p className="text-[15px] font-medium text-[var(--text-muted)]">
                No YouTube channels match your current filter selection.
              </p>
              <button
                onClick={resetFilters}
                className="mt-3 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline"
              >
                Reset all filters &rarr;
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {channels.map((channel, i) => (
                  <React.Fragment key={channel.id || channel.handle}>
                    <ChannelCard channel={channel} />
                    {/* In-feed ad after every 12th card, spanning the full row */}
                    {(i + 1) % AD_EVERY === 0 && i + 1 < channels.length && (
                      <AdSlot format="in-feed" className="col-span-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Load More Button */}
              {channels.length < totalCount && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 h-11 px-8 rounded-full glass border border-[var(--border-line-strong)] text-[13.5px] font-bold text-[var(--text-ink)] hover:border-[var(--brand-mark)] hover:bg-[var(--bg-surface-2)] transition-all shadow-sm hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? 'Loading More Channels...' : `Load More Channels (${(totalCount - channels.length).toLocaleString()} remaining)`}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Table View */
            <div className="glass rounded-2xl border border-[var(--border-line)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-line)] bg-[var(--bg-surface-2)]/60 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-3">Format</th>
                      <th className="py-3 px-3">Niche</th>
                      <th className="py-3 px-3">Subscribers</th>
                      <th className="py-3 px-3">Avg Views</th>
                      <th className="py-3 px-3">Est. RPM</th>
                      <th className="py-3 px-3">Monthly Rev</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((channel, i) => (
                      <React.Fragment key={channel.id || channel.handle}>
                        <ChannelTableRow channel={channel} />
                        {(i + 1) % AD_EVERY === 0 && i + 1 < channels.length && (
                          <tr>
                            <td colSpan={8} className="p-3">
                              <AdSlot format="in-feed" />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More in Table View */}
              {channels.length < totalCount && (
                <div className="p-4 border-t border-[var(--border-line)] text-center bg-[var(--bg-surface-2)]/30">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}
                    className="btn-accent h-9 px-6 rounded-full text-xs font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Loading More Channels...' : `Load More Channels (${(totalCount - channels.length).toLocaleString()} remaining)`}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      <CreatorToolkit />

      {/* Newsletter teaser (the Header's "Weekly Report" link points here) */}
      <section id="newsletter" className="glass mt-16 rounded-2xl border border-[var(--border-line)] p-6 sm:p-8 scroll-mt-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[var(--brand-mark)]">
              <Mail className="size-3.5" />
              Weekly Niche Intelligence
            </div>
            <h3 className="text-lg font-bold text-[var(--text-ink)]">Get high-RPM niche opportunities first</h3>
            <p className="mt-1 text-[13px] leading-normal text-[var(--text-muted)]">
              Every Monday: fast-growing small channels, RPM benchmarks and outlier title patterns.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to YT Niches Weekly Intelligence!');
            }}
            className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
          >
            <input
              type="email"
              required
              placeholder="creator@example.com"
              className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface-2)] px-4 text-[13.5px] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-mark)] focus:outline-none md:w-64"
            />
            <button type="submit" className="btn-accent h-10 shrink-0 rounded-xl px-5 text-[13.5px] font-semibold">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
