import React from 'react';
import { Bot, Clapperboard, Lightbulb, Mic, PenLine, ShoppingBag, Target, Users, Wand2, type LucideIcon } from 'lucide-react';
import type { Channel, Niche } from '@/types';

type Format = 'avatar' | 'faceless' | 'documentary';
const FORMAT_LABEL: Record<Format, string> = { avatar: 'AI avatar host', faceless: 'Faceless voiceover', documentary: 'Documentary' };

// Suggested tools per production format. Recommendations, not tools these channels confirmed using.
const TOOLS: Record<Format, { icon: LucideIcon; role: string; tool: string; note: string }[]> = {
  avatar: [
    { icon: PenLine, role: 'Scripting', tool: 'Claude', note: 'Outline, hook and full script in the host’s voice' },
    { icon: Bot, role: 'AI host', tool: 'HeyGen', note: 'One consistent photorealistic presenter for every video' },
    { icon: Mic, role: 'Voiceover', tool: 'ElevenLabs', note: 'A fixed voice such as “Adam” (deep) or “Antoni” (warm)' },
    { icon: Wand2, role: 'Visuals', tool: 'Midjourney', note: 'Photorealistic scenes and thumbnails around the host' },
    { icon: Clapperboard, role: 'Assembly', tool: 'CapCut Desktop', note: 'Cut, captions, b-roll and sound' },
  ],
  faceless: [
    { icon: PenLine, role: 'Scripting', tool: 'Claude', note: 'Research notes into a tight, retention-first script' },
    { icon: Mic, role: 'Voiceover', tool: 'ElevenLabs', note: '“Adam” for authority or “Antoni” for a warmer narrator' },
    { icon: Wand2, role: 'Visuals', tool: 'Midjourney', note: 'Photorealistic stills plus stock footage for motion' },
    { icon: Clapperboard, role: 'Assembly', tool: 'CapCut Desktop', note: 'Pacing, captions, zooms and music' },
  ],
  documentary: [
    { icon: PenLine, role: 'Scripting', tool: 'Claude', note: 'Fact-checked chronology turned into a narrative arc' },
    { icon: Mic, role: 'Voiceover', tool: 'ElevenLabs', note: 'A deep narrator voice such as “Adam”' },
    { icon: Wand2, role: 'Visuals', tool: 'Midjourney', note: 'Photorealistic reconstructions next to archival footage' },
    { icon: Clapperboard, role: 'Assembly', tool: 'CapCut Desktop', note: 'Maps, timelines, captions and score' },
  ],
};

const median = (xs: number[]) => {
  const s = xs.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const minutes = (sec: number) => (sec >= 3600 ? `${(sec / 3600).toFixed(1)} h` : `${Math.round(sec / 60)} min`);
const unique = (xs: (string | null | undefined)[]) => [...new Set(xs.map((x) => x?.trim()).filter((x): x is string => !!x))];

// Starter templates (used only when the niche has no real title patterns yet).
const templates = (name: string) => [
  `The [Event] That Changed ${name} Forever (Documentary)`,
  `Why Nobody Talks About [${name} Secret]...`,
  `How [Channel/Person] Made $[Amount] in [Timeframe] with ${name}`,
];

/** Creator blueprint for one niche, calculated from the channels matched to it. */
export default function NichePlaybook({ niche, channels }: { niche: Niche; channels: Channel[] }) {
  const n = channels.length;
  const formatCounts = (['avatar', 'faceless', 'documentary'] as Format[])
    .map((f) => ({ f, count: channels.filter((c) => c.format === f).length }))
    .sort((a, b) => b.count - a.count);
  const main: Format = formatCounts[0]?.count ? formatCounts[0].f : niche.formatRecommendation.toLowerCase().includes('avatar') ? 'avatar' : 'faceless';
  const typicalLength = median(channels.map((c) => c.medianLengthSeconds ?? NaN));
  const uploads = median(channels.map((c) => c.uploadsPerWeek ?? NaN));
  const sellers = channels.filter((c) => c.offers?.length);
  const offerTypes = Object.entries(
    sellers.flatMap((c) => c.offers!.map((o) => o.type)).reduce<Record<string, number>>((m, t) => ((m[t] = (m[t] ?? 0) + 1), m), {})
  ).sort((a, b) => b[1] - a[1]);
  const audience = channels.map((c) => c.deepAnalysis?.targetAudience).find((a) => a && a.trim().length > 20);
  const pillars = unique(channels.flatMap((c) => c.deepAnalysis?.contentPillars ?? [])).slice(0, 5);
  const realFormulas = unique(channels.flatMap((c) => [...(c.titlePatterns ?? []), ...(c.deepAnalysis?.titlePatterns ?? [])]));
  const formulas = realFormulas.length >= 3 ? realFormulas.slice(0, 3) : [...realFormulas, ...templates(niche.name)].slice(0, 3);
  const formulasAreReal = realFormulas.length >= 3;

  return (
    <section aria-labelledby="playbook-title" className="glass rounded-2xl p-6 sm:p-8 border border-[var(--border-line)] my-10">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-mark)] mb-2">
        <Lightbulb className="size-4" /> Creator AI Playbook
      </div>
      <h2 id="playbook-title" className="text-xl sm:text-2xl font-bold text-[var(--text-ink)]">
        How to start a {niche.name} channel
      </h2>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 mb-6">
        {n
          ? `Calculated from the ${n.toLocaleString()} channel${n === 1 ? '' : 's'} we track in this niche.`
          : 'We don’t track enough channels in this niche yet, so these are general starting points.'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Persona & audience */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-ink)] flex items-center gap-2"><Users className="size-4 text-[var(--brand-mark)]" /> Persona &amp; target audience</h3>
          {n > 0 && (
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] p-3">
                <dt className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Main format</dt>
                <dd className="font-semibold text-[var(--text-ink)]">{FORMAT_LABEL[main]} ({Math.round((formatCounts[0].count / n) * 100)}%)</dd>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] p-3">
                <dt className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Typical length</dt>
                <dd className="font-semibold text-[var(--text-ink)]">{typicalLength ? minutes(typicalLength) : '–'}</dd>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] p-3">
                <dt className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Uploads per week</dt>
                <dd className="font-semibold text-[var(--text-ink)]">{uploads ?? '–'}</dd>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] p-3">
                <dt className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Sell a product</dt>
                <dd className="font-semibold text-[var(--text-ink)]">{Math.round((sellers.length / n) * 100)}% of channels</dd>
              </div>
            </dl>
          )}
          <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text-ink)]">Who watches: </strong>
            {audience ?? `People searching for ${niche.name.toLowerCase()} content on YouTube. ${niche.saturation} competition, demand score ${niche.demandScore}/10.`}
          </p>
          {pillars.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-[var(--text-ink)] mb-1.5 flex items-center gap-1.5"><Target className="size-3.5" /> What they come for</p>
              <ul className="flex flex-wrap gap-1.5">
                {pillars.map((p) => <li key={p} className="px-2 py-1 rounded-lg text-[12px] bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-muted)]">{p}</li>)}
              </ul>
            </div>
          )}
          {offerTypes.length > 0 && (
            <p className="text-[13px] text-[var(--text-muted)] flex items-start gap-1.5">
              <ShoppingBag className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span><strong className="text-[var(--text-ink)]">What sellers offer: </strong>{offerTypes.slice(0, 4).map(([t, c]) => `${t.replace('_', ' ')} (${c})`).join(', ')}</span>
            </p>
          )}
        </div>

        {/* AI tools */}
        <div>
          <h3 className="text-sm font-bold text-[var(--text-ink)] mb-3 flex items-center gap-2"><Wand2 className="size-4 text-[var(--brand-mark)]" /> AI tools needed ({FORMAT_LABEL[main].toLowerCase()})</h3>
          <ul className="space-y-2">
            {TOOLS[main].map(({ icon: Icon, role, tool, note }) => (
              <li key={role} className="flex gap-3 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] p-3">
                <Icon className="size-4 shrink-0 text-[var(--brand-mark)] mt-0.5" />
                <div className="text-[13px]">
                  <span className="font-semibold text-[var(--text-ink)]">{role}: {tool}</span>
                  <span className="block text-[12px] text-[var(--text-muted)]">{note}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">Our suggested stack for this format, not tools these channels have confirmed using.</p>
        </div>
      </div>

      {/* Title formulas */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-[var(--text-ink)] mb-1">3 high-CTR title formulas</h3>
        <p className="text-[12px] text-[var(--text-muted)] mb-3">
          {formulasAreReal ? `Patterns from real ${niche.name} channels' best videos.` : 'Starter templates: fill the [brackets] with your own topic.'}
        </p>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {formulas.map((f, i) => (
            <li key={f} className="p-3.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)]">
              <span className="text-[10px] font-bold text-[var(--brand-mark)] uppercase tracking-wider block mb-1">Formula #{i + 1}</span>
              <p className="text-[13.5px] font-semibold text-[var(--text-ink)] leading-snug">&ldquo;{f}&rdquo;</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
