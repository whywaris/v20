import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'YouTube Niche Intelligence Blog & Guides · YT Niches',
  description: 'Data-driven guides, RPM benchmarks, and case studies on growing and monetizing faceless YouTube channels in 2026.',
  alternates: {
    canonical: 'https://ytniches.com/blog'
  }
};

// Published posts come from Supabase (written in /admin), with the built-in posts as fallback.
// revalidate: refreshed every 5 minutes; saving in /admin also refreshes it immediately.
export const revalidate = 300;

export default async function BlogHubPage() {
  const BLOG_POSTS = await getPublishedPosts();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      
      {/* 1. Schema.org CollectionPage & BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'YouTube Niche Intelligence Blog & Guides',
            description: 'Data-driven guides, RPM benchmarks, and case studies on growing and monetizing faceless YouTube channels.',
            url: 'https://ytniches.com/blog',
            numberOfItems: BLOG_POSTS.length
          })
        }}
      />
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
              }
            ]
          })
        }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-ink)] transition-colors">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="text-[var(--text-ink)] font-semibold" aria-current="page">Blog</span>
      </nav>

      {/* Blog Hero */}
      <div className="mb-12 border-b border-[var(--border-line)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-3">
          <BookOpen className="size-3.5" />
          The Niche Intelligence Journal
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tracking-tight">
          YouTube Growth, RPM &amp; Niche Playbooks
        </h1>
        <p className="text-[15.5px] text-[var(--text-muted)] mt-2 max-w-2xl">
          Actionable blueprints and deep data breakdowns based on 6,800+ tracked YouTube channels and 18,000+ viral outlier videos.
        </p>
      </div>

      {/* Featured Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="glass-card rounded-2xl overflow-hidden flex flex-col group"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/20">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-black/60 text-white backdrop-blur-md">
                {post.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)] mb-2.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {post.date}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] transition-colors leading-snug mb-3">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline pt-4 border-t border-[var(--border-line)]"
              >
                Read Full Blueprint <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
