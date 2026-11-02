import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Niche, Channel, VideoOutlierItem } from '@/types';
import ChannelCard from '@/components/channels/ChannelCard';
import NicheRevenueCalculator from '@/components/niche/NicheRevenueCalculator';
import AdSlot from '@/components/ads/AdSlot';
import NicheFaqAccordion from '@/components/niche/NicheFaqAccordion';
import { formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  DollarSign,
  Users,
  Eye,
  Bot,
  User,
  Lightbulb,
  Play,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

function getNicheData(slug: string) {
  const dataDir = path.join(process.cwd(), 'data');
  const nichesFile = path.join(dataDir, 'unified_niches.json');
  const channelsFile = path.join(dataDir, 'unified_channels.json');
  const outliersFile = path.join(dataDir, 'unified_outliers.json');

  let niche: Niche | null = null;
  let topChannels: Channel[] = [];
  let nicheOutliers: VideoOutlierItem[] = [];
  let relatedNiches: Niche[] = [];

  try {
    if (fs.existsSync(nichesFile)) {
      const niches: Niche[] = JSON.parse(fs.readFileSync(nichesFile, 'utf8'));
      const decoded = decodeURIComponent(slug).toLowerCase().trim();
      const cleanSlug = decoded.replace(/^\/+|\/+$/g, '');

      // 1. Exact match by slug or name
      niche = niches.find((n) => 
        n.slug.toLowerCase() === cleanSlug || 
        n.name.toLowerCase() === cleanSlug ||
        n.slug.toLowerCase().replace(/-/g, '') === cleanSlug.replace(/-/g, '')
      ) || null;

      // 2. Substring match
      if (!niche) {
        niche = niches.find((n) => 
          n.slug.toLowerCase().includes(cleanSlug) || 
          cleanSlug.includes(n.slug.toLowerCase())
        ) || null;
      }

      // 3. Keyword token match
      if (!niche) {
        const words = cleanSlug.split(/[-_+\s]+/).filter((w) => w.length > 2);
        niche = niches.find((n) => words.some((w) => n.slug.toLowerCase().includes(w))) || null;
      }

      if (niche) {
        // Pick 6 related niches
        relatedNiches = niches
          .filter((n) => n.slug !== niche?.slug)
          .slice(0, 6);
      }
    }

    if (fs.existsSync(channelsFile) && niche) {
      const channels: Channel[] = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
      const q = niche.name.toLowerCase();
      const qSlug = niche.slug.toLowerCase();
      topChannels = channels
        .filter((c) =>
          (c.categories || []).some((cat) => cat.toLowerCase().includes(q) || q.includes(cat.toLowerCase())) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase())) ||
          (c.categories || []).some((cat) => cat.toLowerCase().includes(qSlug))
        )
        .slice(0, 12);

      if (topChannels.length === 0) {
        topChannels = channels.slice(0, 6);
      }
    }

    if (fs.existsSync(outliersFile) && niche) {
      const allOutliers: VideoOutlierItem[] = JSON.parse(fs.readFileSync(outliersFile, 'utf8'));
      const q = niche.name.toLowerCase();
      const qSlug = niche.slug.toLowerCase();
      nicheOutliers = allOutliers
        .filter((o) =>
          (o.category || '').toLowerCase().includes(q) ||
          q.includes((o.category || '').toLowerCase()) ||
          (o.tags || []).some((t) => t.toLowerCase().includes(q) || t.toLowerCase().includes(qSlug))
        )
        .slice(0, 6);

      if (nicheOutliers.length === 0) {
        nicheOutliers = allOutliers.slice(0, 6);
      }
    }
  } catch (e) {
    console.error('Error fetching niche data:', e);
  }

  return { niche, topChannels, nicheOutliers, relatedNiches };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { niche } = getNicheData(slug);
  if (!niche) return { title: 'Niche Not Found · YT Niches' };

  const rpmFormatted = niche.rpm.avg.toFixed(2);
  const minRpm = niche.rpm.min.toFixed(2);
  const maxRpm = niche.rpm.max.toFixed(2);

  return {
    title: `${niche.name} YouTube Niche: RPM ($${rpmFormatted}), Top Channels & Outliers [2026] · YT Niches`,
    description: `Complete breakdown of the ${niche.name} YouTube niche. Benchmark AdSense RPM of $${rpmFormatted} ($${minRpm}-$${maxRpm}), ${niche.saturation} competition, top competitor channels, and viral title formulas.`,
    keywords: [
      `${niche.name} youtube niche`,
      `${niche.name} youtube rpm`,
      `${niche.name} faceless channel`,
      `${niche.name} video ideas`,
      'profitable youtube niches 2026',
      'youtube niche directory',
      'yt niches'
    ],
    alternates: {
      canonical: `https://ytniches.com/niche/${slug}`
    },
    openGraph: {
      title: `${niche.name} YouTube Niche: RPM ($${rpmFormatted}), Channels & Viral Ideas`,
      description: `Benchmark AdSense RPM ($${rpmFormatted}), view velocity, competition score, and top outlier video blueprints in ${niche.name}.`,
      url: `https://ytniches.com/niche/${slug}`,
      siteName: 'YT Niches',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${niche.name} YouTube Niche: RPM ($${rpmFormatted}) · YT Niches`,
      description: `Benchmark AdSense RPM ($${rpmFormatted}), view velocity, and top competitor channels in ${niche.name}.`
    }
  };
}

export default async function NicheDetailPage({ params }: Props) {
  const { slug } = await params;
  const { niche, topChannels, nicheOutliers, relatedNiches } = getNicheData(slug);

  if (!niche) {
    notFound();
  }

  const isAvatarNiche = niche.formatRecommendation.includes('Avatar');
  const est100k = Math.round((100000 / 1000) * niche.rpm.avg).toLocaleString();
  const est500k = Math.round((500000 / 1000) * niche.rpm.avg).toLocaleString();

  // Programmatic FAQs for Schema.org and human UI
  const faqItems = [
    {
      question: `What is the average YouTube RPM and earning potential for ${niche.name}?`,
      badge: `$${niche.rpm.avg.toFixed(2)} Avg. RPM`,
      answer: `${niche.name} channels on YouTube generate an estimated benchmark RPM of $${niche.rpm.avg.toFixed(2)} per 1,000 monetized views, with payouts typically ranging between $${niche.rpm.min.toFixed(2)} and $${niche.rpm.max.toFixed(2)} depending on viewer geography and average watch duration. Based on this RPM, an active channel accumulating 100,000 views per month can expect approximately $${est100k} in YouTube AdSense revenue. At 500,000 views per month, AdSense earnings scale to ~$${est500k}/mo. Channels incorporating digital products, affiliate recommendations, and sponsorships frequently multiply baseline ad revenue by 2x to 4x.`
    },
    {
      question: `Can you build a faceless or AI avatar channel in the ${niche.name} niche?`,
      badge: niche.formatRecommendation,
      answer: `Yes. The recommended production format for ${niche.name} is "${niche.formatRecommendation}". ${
        isAvatarNiche
          ? 'Audience retention in this space is substantially elevated by a recurring host persona. Photorealistic AI avatars generated via HeyGen or Midjourney paired with ElevenLabs voice synthesis allow creators to build recognizable personal brand equity without ever showing their real face on camera.'
          : 'Faceless documentary-style videos perform exceptionally well in this space when combined with cinematic B-roll, motion graphics, and engaging voice narration. Successful creators utilize AI tools like Claude or ChatGPT for retention scripting and ElevenLabs for natural studio-grade voiceovers.'
      }`
    },
    {
      question: `How competitive is the ${niche.name} YouTube niche?`,
      badge: `${niche.saturation} Saturation`,
      answer: `The ${niche.name} niche currently exhibits a competition saturation level rated as "${niche.saturation}" with ${niche.channelCount.toLocaleString()} verified competitor channels tracked across the YT Niches directory, and an overall market demand score of ${niche.demandScore} / 10. Creators entering this space should focus on high-multiplier curiosity gap angles and proven title formulas rather than generic topics to stand out rapidly.`
    },
    {
      question: `How do top creators in ${niche.name} monetize beyond YouTube AdSense?`,
      badge: 'Diversified Income',
      answer: `Top creators in ${niche.name} build diversified revenue funnels: 1) Selling niche-specific digital starter guides or templates ($27 - $49 one-time purchase), 2) High-commission affiliate partnerships in the ${niche.name} ecosystem, and 3) Dedicated brand sponsorships once maintaining a steady viewership of 25,000+ views per upload.`
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      
      {/* 1. Schema.org CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${niche.name} YouTube Niche Blueprint`,
            description: `Complete breakdown of the ${niche.name} YouTube niche with estimated RPM and top competitor channels.`,
            url: `https://ytniches.com/niche/${slug}`,
            numberOfItems: niche.channelCount
          })
        }}
      />

      {/* 2. Schema.org BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://ytniches.com/'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Niches',
                item: 'https://ytniches.com/niche'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: niche.name,
                item: `https://ytniches.com/niche/${slug}`
              }
            ]
          })
        }}
      />

      {/* 3. Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
              }
            }))
          })
        }}
      />

      {/* Visual Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <Link href="/niche" className="hover:text-[var(--text-ink)] transition-colors">Niches</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold truncate" aria-current="page">{niche.name}</span>
      </nav>

      {/* Hero: Niche Header & Intelligence Scorecard */}
      <div className="glass rounded-3xl p-6 sm:p-10 border border-[var(--border-line)] mb-10 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Niche Intelligence Blueprint
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            ${niche.rpm.avg.toFixed(2)} Avg. RPM
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            niche.saturation === 'Low'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : niche.saturation === 'Medium'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {niche.saturation} Competition
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-ink)] tracking-tight leading-[1.15] mb-4">
          {niche.name} YouTube Niche Blueprint
        </h1>

        <p className="text-[15.5px] text-[var(--text-muted)] leading-relaxed max-w-3xl mb-8">
          The <strong>{niche.name}</strong> niche on YouTube currently tracks <strong>{niche.channelCount.toLocaleString()} channels</strong> with an average view velocity of <strong>{formatNumber(niche.avgViews)} views</strong> per upload. Content in this vertical commands a benchmark AdSense RPM range between <strong>${niche.rpm.min.toFixed(2)}</strong> and <strong>${niche.rpm.max.toFixed(2)}</strong>, with highest profitability achieved via mid-roll ad placement and digital product backends.
        </p>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[var(--border-line)]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Benchmark RPM</div>
            <div className="text-2xl sm:text-3xl font-extrabold num-mono text-emerald-500 mt-1">
              ${niche.rpm.avg.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Tracked Channels</div>
            <div className="text-2xl sm:text-3xl font-extrabold num-mono text-[var(--text-ink)] mt-1">
              {niche.channelCount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Avg Views/Video</div>
            <div className="text-2xl sm:text-3xl font-extrabold num-mono text-[var(--text-ink)] mt-1">
              {formatNumber(niche.avgViews)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Demand Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold num-mono text-[var(--brand-mark)] mt-1">
              {niche.demandScore} / 10
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Interactive AdSense Revenue Calculator */}
      <NicheRevenueCalculator nicheName={niche.name} rpm={niche.rpm} />
      <AdSlot format="rectangle" className="my-8" />

      {/* 3. Production & Format Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        
        {/* Format Verdict Card */}
        <div className="glass rounded-2xl p-6 border border-[var(--border-line)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-mark)] mb-2">
            {isAvatarNiche ? <Bot className="size-4" /> : <User className="size-4" />}
            Recommended Production Format
          </div>
          <h3 className="text-lg font-bold text-[var(--text-ink)] mb-3">
            {niche.formatRecommendation}
          </h3>
          <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed mb-4">
            Audience retention in the {niche.name} space responds best to consistent host recognition and narrative storytelling. Pair a photorealistic avatar or authoritative narration with documentary-style B-roll.
          </p>
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-xs text-[var(--text-ink)] space-y-1.5">
            <div className="font-semibold text-[var(--brand-mark)]">Recommended AI Stack:</div>
            <div>&bull; Scripting: Claude 3.5 Sonnet / DeepSeek (1,800 - 2,500 word retention arc)</div>
            <div>&bull; Voiceover: ElevenLabs (Deep narrative or empathetic storyteller voice)</div>
            <div>&bull; Visuals: Midjourney v6 + Runway Gen-3 cinematic B-roll</div>
          </div>
        </div>

        {/* Monetization Models Card */}
        <div className="glass rounded-2xl p-6 border border-[var(--border-line)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">
            <DollarSign className="size-4" />
            Monetization Beyond AdSense
          </div>
          <h3 className="text-lg font-bold text-[var(--text-ink)] mb-3">
            Digital Offers &amp; Backend Funnels
          </h3>
          <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed mb-4">
            Top creators in this category do not rely solely on YouTube ad revenue. They monetize with dedicated downloadable bundles linked directly in the pinned comment.
          </p>
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-xs text-[var(--text-ink)] space-y-1.5">
            <div className="font-semibold text-emerald-500">Proven Product Types:</div>
            <div>&bull; $29 Specialized Starter Guide / Cheat Sheet (Gumroad/Stripe)</div>
            <div>&bull; Curated Notion Database / Resource Checklist</div>
            <div>&bull; High-ticket Affiliate Software / Physical Tool Recommendations</div>
          </div>
        </div>

      </div>

      {/* 4. Viral Title Blueprints (Curiosity Gap Formulas) */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--border-line)] my-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand-mark)] uppercase tracking-wider mb-2">
          <Lightbulb className="size-4" />
          Algorithmic Blueprint
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-ink)] mb-2">
          5 Viral Title Formulas for {niche.name}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6">
          Deconstructed from 18,000+ outlier videos that generated over 10x the channel subscriber count:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {niche.topTitleFormulas.map((formula, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[var(--bg-surface-2)] border border-[var(--border-line)] flex items-start justify-between gap-3 group hover:border-[var(--brand-mark)] transition-colors"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[var(--brand-mark)] uppercase tracking-wider block mb-1">
                  Formula #{idx + 1}
                </span>
                <p className="text-[13.5px] font-semibold text-[var(--text-ink)] leading-snug">
                  &ldquo;{formula}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Top Performing Channels in this Niche */}
      <div className="my-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-ink)] flex items-center gap-2">
              <Sparkles className="size-5 text-[var(--brand-mark)]" />
              Top Competitor Channels in {niche.name}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Examine their format, view velocity, and outlier video formulas.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-[var(--brand-mark)] hover:underline hidden sm:inline-flex items-center gap-1"
          >
            All Channels &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topChannels.map((c) => (
            <ChannelCard key={c.id || c.handle} channel={c} />
          ))}
        </div>
      </div>

      {/* 6. Viral Outliers in this Niche */}
      {nicheOutliers.length > 0 && (
        <div className="my-12 pt-8 border-t border-[var(--border-line)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-ink)] flex items-center gap-2">
                <Play className="size-5 text-[var(--brand-mark)]" />
                Viral Outliers in {niche.name}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Videos that scored 5x to 50x higher viewership than average.
              </p>
            </div>
            <Link
              href="/outliers"
              className="text-xs font-semibold text-[var(--brand-mark)] hover:underline inline-flex items-center gap-1"
            >
              Browse All Outliers &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nicheOutliers.map((vid) => (
              <a
                key={vid.id}
                href={vid.videoUrl || `https://www.youtube.com/watch?v=${vid.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="glass-card rounded-2xl overflow-hidden group block border border-[var(--border-line)] hover:border-[var(--brand-accent)]/50 transition-all"
              >
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {vid.viewsFormatted && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm">
                      {vid.viewsFormatted}
                    </span>
                  )}
                  {vid.multiplier && vid.multiplier > 1 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black shadow-md">
                      {vid.multiplier}x Outlier
                    </span>
                  )}
                  {vid.durationFormatted && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/85 text-white backdrop-blur-sm">
                      {vid.durationFormatted}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                      <Play className="size-4 fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors line-clamp-2 mb-2 leading-snug">
                    {vid.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="truncate">{vid.channelTitle}</span>
                    <span className="font-semibold text-emerald-500">Watch &rarr;</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 7. Comprehensive Programmatic FAQ Accordion (User-Facing & Crawlable) */}
      <NicheFaqAccordion nicheName={niche.name} items={faqItems} />

      {/* 8. Internal SEO Links to Related Niches */}
      {relatedNiches.length > 0 && (
        <div className="mt-14 pt-8 border-t border-[var(--border-line)]">
          <h3 className="font-bold text-lg text-[var(--text-ink)] mb-4">
            Explore Related YouTube Niches
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {relatedNiches.map((rn) => (
              <Link
                key={rn.slug}
                href={`/niche/${rn.slug}`}
                className="glass-card rounded-xl p-3 text-center group block hover:border-[var(--brand-mark)] transition-all"
              >
                <div className="font-semibold text-xs text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors truncate">
                  {rn.name}
                </div>
                <div className="text-[11px] text-emerald-500 font-mono mt-0.5">
                  ${rn.rpm.avg.toFixed(2)} RPM
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
