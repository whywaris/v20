import React from 'react';
import { CheckCircle2, DollarSign, Gift, Repeat, ShoppingBag, Sparkles, Target } from 'lucide-react';
import { Channel } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Prefer a non-empty top-level list, else the deepAnalysis one (top-level lists are often present but empty).
const pick = (a?: string[] | null, b?: string[] | null) => (a?.length ? a : b ?? []);

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 border border-[var(--border-line)]">
      <h3 className="text-[15px] font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2">
        <Icon className="size-4 text-[var(--brand-mark)]" /> {title}
      </h3>
      {children}
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">{label}</div>
    <div className="text-xl font-bold num-mono text-[var(--text-ink)] mt-0.5">{value}</div>
  </div>
);

// Shown only to signed-in visitors (the page decides). Everything here is free.
export default function MemberInsights({ channel }: { channel: Channel }) {
  const rpm = channel.estimatedRpm;
  const monthly = channel.estimatedMonthlyRevenueUsd;
  const titlePatterns = pick(channel.titlePatterns, channel.deepAnalysis?.titlePatterns);
  const whyItWorks = pick(channel.whyItWorks, channel.deepAnalysis?.whyItWorks);
  const pillars = channel.deepAnalysis?.contentPillars ?? [];
  const audience = channel.deepAnalysis?.targetAudience;
  const offers = channel.offers ?? [];

  return (
    <section aria-labelledby="member-insights" className="mb-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="member-insights" className="text-xl font-bold text-[var(--text-ink)]">Member insights</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
          <Gift className="size-3" /> Free Community Access
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card icon={DollarSign} title="Estimated AdSense earnings">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Per month" value={monthly ? formatCurrency(monthly) : 'Not estimated'} />
            <Stat label="Per year" value={monthly ? formatCurrency(monthly * 12) : '–'} />
            <Stat label="RPM range" value={rpm ? `$${rpm.min}–$${rpm.max}` : '–'} />
            <Stat label="Typical RPM" value={rpm ? `$${rpm.avg}` : '–'} />
          </div>
          <p className="text-[11.5px] text-[var(--text-muted)] mt-3">Estimates from public view counts and niche RPM benchmarks, not the channel&apos;s real earnings.</p>
        </Card>

        <Card icon={Repeat} title="Upload rhythm">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Uploads / week" value={channel.uploadsPerWeek != null ? channel.uploadsPerWeek : '–'} />
            <Stat label="Typical length" value={channel.medianLengthFormatted || '–'} />
          </div>
          {audience && (
            <p className="text-[13px] text-[var(--text-muted)] mt-3"><strong className="text-[var(--text-ink)]">Audience:</strong> {audience}</p>
          )}
        </Card>

        {offers.length > 0 && (
          <Card icon={ShoppingBag} title="What they sell">
            <ul className="flex flex-wrap gap-2">
              {offers.map((o, i) => (
                <li key={i} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-ink)] capitalize">
                  {o.title || o.type}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {pillars.length > 0 && (
          <Card icon={Target} title="Content pillars">
            <ul className="list-disc pl-5 space-y-1 text-[13px] text-[var(--text-muted)]">
              {pillars.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Card>
        )}
      </div>

      {titlePatterns.length > 0 && (
        <Card icon={Sparkles} title="Proven title formulas">
          <ul className="space-y-2">
            {titlePatterns.map((pat, i) => (
              <li key={i} className="font-mono text-xs bg-[var(--bg-surface-2)] p-2 rounded-lg border border-[var(--border-line)] text-[var(--text-ink)]">{pat}</li>
            ))}
          </ul>
        </Card>
      )}

      {whyItWorks.length > 0 && (
        <Card icon={CheckCircle2} title="Why this channel works">
          <ul className="list-disc pl-5 space-y-2 text-[13px] text-[var(--text-muted)]">
            {whyItWorks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Card>
      )}
    </section>
  );
}
