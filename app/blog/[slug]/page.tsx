import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, Clock, ArrowLeft, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} · YT Niches Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://ytniches.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      images: [post.coverImage],
    },
  };
}

export default async function SingleBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      
      {/* 1. Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.date,
            author: {
              '@type': 'Organization',
              name: 'YT Niches Intelligence Team',
              url: 'https://ytniches.com',
            },
          }),
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
                name: 'Blog',
                item: 'https://ytniches.com/blog'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://ytniches.com/blog/${slug}`
              }
            ]
          }),
        }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <Link href="/blog" className="hover:text-[var(--text-ink)] transition-colors">Blog</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold truncate" aria-current="page">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 text-[11px] font-semibold rounded-full bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3 inline-block">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-ink)] tracking-tight leading-[1.15] mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-[13px] text-[var(--text-muted)] pb-6 border-b border-[var(--border-line)]">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" /> {post.date}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {post.readTime}
          </span>
          <span>&bull;</span>
          <span>By YT Niches Research Team</span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 border border-[var(--border-line)]">
        <img src={post.coverImage} alt={post.title} className="size-full object-cover" />
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-[15.5px] leading-relaxed text-[var(--text-ink)] space-y-6">
        <p className="text-lg font-medium text-[var(--text-muted)] leading-relaxed">
          {post.excerpt}
        </p>

        <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-8 mb-4 border-b border-[var(--border-line)] pb-2">
          1. The Paradigm Shift in YouTube Automation
        </h2>
        <p>
          In recent years, the landscape of YouTube content creation has evolved drastically. Gone are the days when generic voice-over compilation channels could easily build a sustainable business. Today, the highest-performing channels are hyper-specialized, focused on high-retention formats like <strong>first-person avatar storytelling, investigative history documentaries, and aesthetic lifestyle breakdowns</strong>.
        </p>

        <div className="glass rounded-xl p-5 border border-[var(--brand-accent)]/30 my-6">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--brand-mark)] mb-2">
            <Sparkles className="size-4" /> Key Takeaway from 6,800+ Channels Dataset
          </div>
          <p className="text-[14px] text-[var(--text-ink)] m-0">
            Channels that pair AdSense with an authoritative backend digital offer (such as a $29 specialized guide, an old-fashioned recipe book, or an emergency preparedness checklist) generate an average of <strong>3.4x more total monthly profit</strong> compared to channels relying solely on YouTube ad monetization.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-8 mb-4 border-b border-[var(--border-line)] pb-2">
          2. The Top RPM Benchmarks by Category
        </h2>
        <p>
          Based on data aggregated from thousands of monetized creator channels in the YT Niches database, here is the current RPM benchmark landscape:
        </p>

        <ul className="space-y-3 my-4 list-disc pl-5 text-[14.5px]">
          <li><strong>Personal Finance &amp; Frugal Living:</strong> $12.00 – $24.00 RPM</li>
          <li><strong>AI, Software &amp; Tech Tutorials:</strong> $9.00 – $18.50 RPM</li>
          <li><strong>Investigative History &amp; Crime:</strong> $7.50 – $15.00 RPM</li>
          <li><strong>Spirituality, Myths &amp; Crystals:</strong> $6.00 – $13.50 RPM</li>
          <li><strong>Homesteading &amp; Traditional Cooking:</strong> $4.50 – $9.50 RPM</li>
        </ul>

        <h2 className="text-2xl font-bold text-[var(--text-ink)] mt-8 mb-4 border-b border-[var(--border-line)] pb-2">
          3. How to Execute: The 3-Step Action Plan
        </h2>
        <p>
          If you are planning to launch or scale a new channel, follow this proven sequence:
        </p>

        <ol className="space-y-3 my-4 list-decimal pl-5 text-[14.5px]">
          <li><strong>Validate with Outliers:</strong> Search our <Link href="/swipe-file" className="text-[var(--brand-mark)] underline">Swipe File Vault</Link> for videos in your niche that received 10x more views than the channel has subscribers.</li>
          <li><strong>Adopt Proven Title Formulas:</strong> Re-package your topics using curiosity gap formulas like <em>&quot;Most People Cook [X] Wrong! Try This Trick Instead&quot;</em> or <em>&quot;What No One Tells You About [Subject]&quot;</em>.</li>
          <li><strong>Build an Email Funnel on Day 1:</strong> Collect subscriber emails from your YouTube bio and link directly to a high-converting Gumroad or Stripe checkout.</li>
        </ol>
      </div>

      {/* Author & CTA Box */}
      <div className="mt-12 pt-8 border-t border-[var(--border-line)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center font-bold text-sm">
            YT
          </div>
          <div>
            <div className="font-semibold text-sm text-[var(--text-ink)]">YT Niches Intelligence</div>
            <div className="text-[12px] text-[var(--text-muted)]">Data-driven research for modern YouTube creators</div>
          </div>
        </div>

        <Link
          href="/"
          className="btn-accent h-9 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
        >
          Explore 6,800+ Channels &rarr;
        </Link>
      </div>

    </article>
  );
}
