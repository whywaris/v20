import Link from 'next/link';
import { Play } from 'lucide-react';

export interface SpotlightVideo {
  title: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  channelAvgViews: number;
  times: number;
  channelTitle: string;
  channelSlug: string;
  channelThumbnail: string | null;
  channelSubs: number;
}

const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function OutlierSpotlight({ videos }: { videos: SpotlightVideo[] }) {
  if (!videos.length) return null;
  return (
    <section className="mb-14" aria-labelledby="spotlight-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="spotlight-title" className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">
            Viral Outlier Spotlight
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">Videos that pulled 5–10x their channel&apos;s average views.</p>
        </div>
        <Link href="/outliers" className="hidden shrink-0 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline sm:block">
          All outliers →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {videos.map((v) => (
          <article key={v.videoUrl} className="glass-card group flex flex-col overflow-hidden rounded-2xl">
            <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden bg-[var(--bg-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumbnail} alt={v.title} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="ml-0.5 size-5 fill-black text-black" />
                </span>
              </span>
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--brand-accent)] to-amber-500 px-2.5 py-1 text-[12px] font-extrabold text-white shadow-lg">
                🔥 <span className="num-mono">{v.times}x</span> Channel Avg
              </span>
            </a>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--text-ink)]">{v.title}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-lg bg-[var(--bg-surface-2)] px-2.5 py-1.5">
                  <div className="text-[var(--text-muted)]">This video</div>
                  <div className="num-mono font-bold text-[var(--text-ink)]">{compact(v.views)} views</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-surface-2)] px-2.5 py-1.5">
                  <div className="text-[var(--text-muted)]">Channel avg</div>
                  <div className="num-mono font-bold text-[var(--text-ink)]">{compact(v.channelAvgViews)} views</div>
                </div>
              </div>
              <Link href={`/channel/${v.channelSlug}`} className="mt-auto flex items-center gap-2 pt-4 text-[13px] font-semibold text-[var(--text-muted)] hover:text-[var(--brand-mark)]">
                {v.channelThumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.channelThumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-6 rounded-full object-cover" />
                )}
                <span className="truncate">{v.channelTitle}</span>
                <span className="num-mono shrink-0 font-normal">· {compact(v.channelSubs)} subs</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
