import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ChannelAvatar from '@/components/home/ChannelAvatar';

export interface BentoNiche {
  name: string;
  slug: string;
  rpmMin: number;
  rpmAvg: number;
  rpmMax: number;
  saturation: 'Low' | 'Medium' | 'High';
  channelCount: number;
  avatars: { title: string; thumbnail: string | null }[];
}

const SATURATION = {
  Low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  High: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export default function TopNichesBento({ niches, totalNichesCount }: { niches: BentoNiche[]; totalNichesCount: number }) {
  if (!niches.length) return null;
  return (
    <section className="py-12" aria-labelledby="bento-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="bento-title" className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">
            Highest-paying niches
          </h2>
          <p className="mt-1 text-[15px] text-[var(--text-muted)]">Benchmark RPM and how crowded each niche is.</p>
        </div>
        <Link href="/niche" className="text-[14px] font-semibold text-[var(--brand-mark)] hover:underline">
          Explore all {totalNichesCount.toLocaleString()} niches →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {niches.map((n) => (
          <Link
            key={n.slug}
            href={`/niche/${n.slug}`}
            className="group rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--brand-accent)]/40 hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold capitalize text-[var(--text-ink)]">{n.name}</h3>
              <ArrowUpRight className="size-5 shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--brand-mark)]" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="num-mono text-3xl font-extrabold text-[var(--text-ink)]">${n.rpmAvg}</span>
              <span className="text-[13px] text-[var(--text-muted)]">avg RPM</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[12px]">
              <span className="num-mono text-[var(--text-muted)]">
                ${n.rpmMin}–${n.rpmMax} range
              </span>
              <span className={`rounded-full px-2 py-0.5 font-semibold ${SATURATION[n.saturation] ?? SATURATION.Medium}`}>{n.saturation} competition</span>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-[var(--border-line)] pt-4">
              <div className="flex -space-x-2">
                {n.avatars.map((a) => (
                  <ChannelAvatar key={a.title} title={a.title} src={a.thumbnail} className="size-7 ring-2 ring-[var(--bg-surface)]" />
                ))}
              </div>
              <span className="text-[13px] text-[var(--text-muted)]">
                <span className="num-mono font-semibold text-[var(--text-ink)]">{n.channelCount.toLocaleString()}</span> small channels
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
