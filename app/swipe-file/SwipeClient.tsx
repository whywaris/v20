'use client';

import React, { useState, useMemo } from 'react';
import { SwipeVideo } from '@/types';
import { Search, Play, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  initialVideos: SwipeVideo[];
}

export default function SwipeClient({ initialVideos }: Props) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [displayCount, setDisplayCount] = useState(24);

  const TAGS = ['All', 'Spirituality', 'History', 'Crime', 'Science', 'Cooking', 'Animation', 'Education'];

  const filteredVideos = useMemo(() => {
    return initialVideos.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = v.title?.toLowerCase().includes(q);
        const matchChannel = v.channelTitle?.toLowerCase().includes(q) || v.channelHandle?.toLowerCase().includes(q);
        if (!matchTitle && !matchChannel) return false;
      }
      if (selectedTag && selectedTag !== 'All') {
        const qTag = selectedTag.toLowerCase();
        const matchCat = (v.categories || []).some((c) => c.toLowerCase().includes(qTag)) ||
                         (v.tags || []).some((t) => t.toLowerCase().includes(qTag));
        if (!matchCat) return false;
      }
      return true;
    });
  }, [initialVideos, search, selectedTag]);

  const displayed = filteredVideos.slice(0, displayCount);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      
      {/* Hero */}
      <div className="mb-8 border-b border-[var(--border-line)] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3">
          <Sparkles className="size-3.5" />
          The NexLev Inspiration Vault
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          YouTube Viral Video Swipe File (18,000+ Outliers)
        </h1>
        <p className="text-[15px] text-[var(--text-muted)] mt-1.5 max-w-2xl">
          High-performing video thumbnails and proven title packaging extracted across thousands of growing channels.
        </p>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <div className="relative w-full sm:w-80">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search video titles, hooks, topics..."
              className="w-full h-10 pl-9 pr-4 text-[13.5px] rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-mark)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === 'All' ? '' : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  (selectedTag === '' && tag === 'All') || selectedTag === tag
                    ? 'bg-[var(--brand-accent)] text-white'
                    : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border border-[var(--border-line)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {displayed.map((vid, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative"
          >
            <div>
              {/* Thumbnail Container */}
              <a
                href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-video w-full overflow-hidden bg-black/40 block"
              >
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="size-10 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center shadow-lg">
                    <Play className="size-4 fill-white" />
                  </div>
                </div>
              </a>

              {/* Title & Channel */}
              <div className="p-3.5">
                <a
                  href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[13.5px] text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors line-clamp-2 leading-snug mb-2 block"
                >
                  {vid.title}
                </a>
                <div className="text-[12px] text-[var(--text-muted)] flex items-center justify-between">
                  <span className="truncate max-w-[150px] font-medium">{vid.channelTitle}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{vid.channelHandle}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 pt-0 flex items-center justify-between border-t border-[var(--border-line)]/50 mt-1">
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[var(--bg-surface-2)] text-[var(--text-muted)] border border-[var(--border-line)]">
                {vid.categories?.[0] || 'Viral Hook'}
              </span>
              <a
                href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11.5px] font-semibold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1"
              >
                Watch <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {displayCount < filteredVideos.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 24)}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full glass border border-[var(--border-line-strong)] text-[13.5px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-mark)] hover:bg-[var(--bg-surface-2)] transition-all"
          >
            Load More Videos ({filteredVideos.length - displayCount} remaining)
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

    </div>
  );
}
