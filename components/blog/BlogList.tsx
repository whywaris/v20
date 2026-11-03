'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import PostCard, { type PostCardData } from '@/components/blog/PostCard';

const PAGE = 9;

/** Search + "load more" over a list of posts. The first post is featured when not searching. */
export default function BlogList({ posts, featureFirst = true }: { posts: PostCardData[]; featureFirst?: boolean }) {
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return s ? posts.filter((p) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(s)) : posts;
  }, [posts, q]);

  const featured = featureFirst && !q && filtered.length > 1 ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <>
      {posts.length > 3 && (
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="h-11 w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] pl-10 pr-10 text-[14px] text-[var(--text-ink)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-mark)] focus:outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)]">
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {featured && (
        <div className="mb-8">
          <PostCard post={featured} featured />
        </div>
      )}

      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, shown).map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        !featured && <p className="py-10 text-center text-[15px] text-[var(--text-muted)]">No articles match &ldquo;{q}&rdquo;.</p>
      )}

      {rest.length > shown && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="h-11 rounded-full border border-[var(--border-line-strong)] px-6 text-[14px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-accent)]"
          >
            Load more articles ({rest.length - shown} more)
          </button>
        </div>
      )}
    </>
  );
}
