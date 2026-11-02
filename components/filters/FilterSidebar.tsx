'use client';

import React from 'react';
import { Search, Filter, X, RotateCcw, Bot, User, CheckCircle2, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

interface FilterSidebarProps {
  search: string;
  setSearch: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  subFilter: string;
  setSubFilter: (v: string) => void;
  formatFilter: string;
  setFormatFilter: (v: string) => void;
  monetizedFilter: string;
  setMonetizedFilter: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  totalResults: number;
  onReset: () => void;
}

const TOP_CATEGORIES = [
  'All Niches',
  'faceless',
  'History',
  'Crystals & Spirituality',
  'Crime',
  'Animation',
  'Education',
  'Science',
  'Finance',
  'Tech',
  'stories',
  'Cooking',
  'frugal living',
  'homesteading'
];

export default function FilterSidebar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  subFilter,
  setSubFilter,
  formatFilter,
  setFormatFilter,
  monetizedFilter,
  setMonetizedFilter,
  sort,
  setSort,
  totalResults,
  onReset
}: FilterSidebarProps) {
  const hasActiveFilters = Boolean(
    search || selectedCategory || subFilter || formatFilter || (monetizedFilter && monetizedFilter !== 'all')
  );

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="glass rounded-2xl p-5 sticky top-20 border border-[var(--border-line)] shadow-sm space-y-5">
        
        {/* Header with active indicator */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-line)]">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[var(--brand-mark)]" />
            <span className="font-bold text-[14px] text-[var(--text-ink)]">Filter Channels</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-[11.5px] font-semibold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>

        {/* 1. Search Query */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, handle, keyword..."
              className="w-full h-9 pl-9 pr-8 text-[12.5px] rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)] transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-ink)]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Channel Format (Pills) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
            Channel Format
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)]">
            <button
              onClick={() => setFormatFilter('')}
              className={`h-8 rounded-lg text-xs font-semibold transition-all ${
                !formatFilter
                  ? 'bg-[var(--bg-surface)] text-[var(--text-ink)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFormatFilter('avatar')}
              className={`h-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all ${
                formatFilter === 'avatar'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-purple-400'
              }`}
            >
              <Bot className="size-3" /> Avatar
            </button>
            <button
              onClick={() => setFormatFilter('faceless')}
              className={`h-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all ${
                formatFilter === 'faceless'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-blue-400'
              }`}
            >
              <User className="size-3" /> Faceless
            </button>
          </div>
        </div>

        {/* 3. Subscribers Size Tier */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
            Subscriber Size
          </label>
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="w-full h-9 px-3 text-[12.5px] font-medium rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)] transition-colors"
          >
            <option value="">All Audience Sizes</option>
            <option value="under10k">🚀 Under 10K (Hidden Gems)</option>
            <option value="10k-50k">📈 10K - 50K (Fast Growing)</option>
            <option value="50k-200k">🏆 50K - 200K (Breakouts)</option>
            <option value="200k+">👑 200K+ (Heavyweights)</option>
          </select>
        </div>

        {/* 4. Niche / Category */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
            Niche / Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-9 px-3 text-[12.5px] font-medium rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)] transition-colors"
          >
            {TOP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Niches' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Monetization */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
            Monetization &amp; Revenue
          </label>
          <select
            value={monetizedFilter}
            onChange={(e) => setMonetizedFilter(e.target.value)}
            className="w-full h-9 px-3 text-[12.5px] font-medium rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)] transition-colors"
          >
            <option value="">Any Monetization</option>
            <option value="ads">✓ Monetized with AdSense</option>
            <option value="products">💰 Sells Digital Product / Offer</option>
            <option value="highrpm">💎 High RPM ($12+ / 1k views)</option>
          </select>
        </div>

        {/* 6. Sort Option */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5">
            Sort Order
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-9 px-3 text-[12.5px] font-medium rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] focus:outline-none focus:border-[var(--brand-mark)] transition-colors"
          >
            <option value="subscribers">Most Subscribers</option>
            <option value="views">Highest Average Views</option>
            <option value="revenue">Highest Est. Revenue</option>
            <option value="rpm">Highest Benchmark RPM</option>
          </select>
        </div>

        {/* Result Counter footer */}
        <div className="pt-3.5 border-t border-[var(--border-line)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Active Results:</span>
          <span className="font-bold text-[var(--text-ink)] num-mono">
            {totalResults.toLocaleString()} channels
          </span>
        </div>

      </div>
    </aside>
  );
}
