import Link from 'next/link';
import { ArrowUpRight, DollarSign } from 'lucide-react';

export interface BentoNiche {
  name: string;
  slug: string;
  rpmMin: number;
  rpmMax: number;
  channelCount: number;
  avatars: { title: string; thumbnail: string }[];
}

export default function TopNichesBento({ niches }: { niches: BentoNiche[] }) {
  if (!niches.length) return null;
  return (
    <section className="mb-14" aria-labelledby="bento-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="bento-title" className="text-2xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-3xl">
            Breakout High-RPM Niches
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">Benchmark RPM ranges and the small channels already winning in them.</p>
        </div>
        <Link href="/niche" className="hidden shrink-0 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline sm:block">
          All niches →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {niches.map((n) => (
          <Link
            key={n.slug}
            href={`/niche/${n.slug}`}
            className="group flex flex-col gap-6 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--brand-accent)]/50 hover:shadow-md hover:shadow-[var(--brand-accent)]/10"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                <DollarSign className="size-3.5" />
                <span className="num-mono">
                  {n.rpmMin} – ${n.rpmMax}
                </span>{' '}
                RPM
              </span>
              <ArrowUpRight className="size-5 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand-mark)]" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-ink)]">{n.name}</h3>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {n.avatars.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={a.thumbnail}
                    src={a.thumbnail}
                    alt={a.title}
                    title={a.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="size-7 rounded-full border-2 border-[var(--bg-surface)] object-cover"
                  />
                ))}
              </div>
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                <span className="num-mono text-[var(--text-ink)]">{n.channelCount.toLocaleString()}</span> channels
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
