import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, Clock, ListOrdered } from 'lucide-react';
import AdSlot from '@/components/ads/AdSlot';
import AuthorBox, { AuthorAvatar } from '@/components/blog/AuthorBox';
import EarningsNote from '@/components/blog/EarningsNote';
import PostCard, { toCard } from '@/components/blog/PostCard';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareButtons from '@/components/blog/ShareButtons';
import { renderArticle, splitForAd } from '@/lib/markdown';
import { getPublishedPosts, mentionsEarnings, relatedPosts } from '@/lib/posts';
import { AUTHOR_PATH, OPERATOR_NAME, SITE_URL } from '@/lib/site';

// Refreshed every 5 minutes; saving a post in /admin refreshes it immediately.
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

async function load(slug: string) {
  const posts = await getPublishedPosts();
  const post = posts.find((p) => p.slug === slug);
  return post ? { post, related: relatedPosts(post, posts) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) return { title: 'Article not found · YT Niches' };
  const { post } = found;
  const title = post.seoTitle || `${post.title} · YT Niches Blog`;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      section: post.category,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: { card: 'summary_large_image', title: post.seoTitle || post.title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();
  const { post, related } = found;
  const { html, toc } = renderArticle(post.content);
  const updated = new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const split = splitForAd(html);
  const prose = 'prose-post max-w-none text-[16.5px] leading-[1.8] text-[var(--text-ink)]';
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <ReadingProgress targetId="article-body" />
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.seoDescription || post.excerpt,
                image: post.coverImage || undefined,
                datePublished: post.publishedAt,
                dateModified: post.updatedAt,
                articleSection: post.category,
                author: { '@type': 'Person', name: OPERATOR_NAME, url: `${SITE_URL}${AUTHOR_PATH}` },
                publisher: { '@type': 'Organization', name: 'YT Niches', url: SITE_URL },
                mainEntityOfPage: url,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: post.category, item: `${SITE_URL}/blog/category/${post.categorySlug}` },
                  { '@type': 'ListItem', position: 3, name: post.title, item: url },
                ],
              },
            ]),
          }}
        />

        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text-ink)]">Home</Link>
          <span className="text-[var(--border-line-strong)]">/</span>
          <Link href={`/blog/category/${post.categorySlug}`} className="hover:text-[var(--text-ink)]">{post.category}</Link>
        </nav>

        <header className="mx-auto max-w-3xl">
          <Link href={`/blog/category/${post.categorySlug}`} className="inline-block rounded-full bg-[var(--brand-accent)]/10 px-3 py-1 text-[12px] font-semibold text-[var(--brand-mark)]">
            {post.category}
          </Link>
          <h1 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-[var(--text-ink)] sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border-line)] pb-6 text-[13px] text-[var(--text-muted)]">
            <Link href={AUTHOR_PATH} rel="author" className="flex items-center gap-2 hover:underline">
              <AuthorAvatar className="size-7 text-[11px]" />
              <span className="font-semibold text-[var(--text-ink)]">{OPERATOR_NAME}</span>
            </Link>
            <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> Published <time dateTime={post.publishedAt ?? undefined}>{post.date}</time></span>
            {updated !== post.date && (
              <span className="flex items-center gap-1.5">Updated <time dateTime={post.updatedAt}>{updated}</time></span>
            )}
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {post.readTime}</span>
          </div>
          {mentionsEarnings(post.content) && <EarningsNote className="mt-6" />}
        </header>

        <AdSlot format="horizontal" className="mx-auto mt-6 max-w-3xl" />

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="mx-auto mt-8 aspect-[16/9] w-full max-w-4xl rounded-2xl border border-[var(--border-line)] object-cover" />
        )}

        <div className={`mx-auto mt-10 grid gap-10 ${toc.length >= 3 ? 'max-w-5xl lg:grid-cols-[1fr_240px]' : 'max-w-3xl'}`}>
          <div id="article-body" className="min-w-0">
            {toc.length >= 3 && (
              <details className="mb-8 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 lg:hidden">
                <summary className="flex cursor-pointer items-center gap-2 text-[14px] font-bold text-[var(--text-ink)]">
                  <ListOrdered className="size-4 text-[var(--brand-mark)]" /> In this article
                </summary>
                <Toc items={toc} />
              </details>
            )}
            {split ? (
              <>
                <div className={prose} dangerouslySetInnerHTML={{ __html: split[0] }} />
                <AdSlot format="in-article" className="my-10" />
                <div className={prose} dangerouslySetInnerHTML={{ __html: split[1] }} />
              </>
            ) : (
              <div className={prose} dangerouslySetInnerHTML={{ __html: html }} />
            )}

            <div className="mt-10 border-t border-[var(--border-line)] pt-6">
              <ShareButtons url={url} title={post.title} />
            </div>

            <div className="mt-8">
              <AuthorBox />
            </div>
          </div>

          {toc.length >= 3 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-3 text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted)]">In this article</div>
                <Toc items={toc} />
              </div>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-6 text-2xl font-bold text-[var(--text-ink)]">Keep reading</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={toCard(p)} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

function Toc({ items }: { items: { id: string; text: string; level: 2 | 3 }[] }) {
  return (
    <ol className="mt-3 space-y-1.5 border-l border-[var(--border-line)] text-[13.5px] lg:mt-0">
      {items.map((t) => (
        <li key={t.id} className={t.level === 3 ? 'pl-6' : 'pl-3'}>
          <a href={`#${t.id}`} className="block text-[var(--text-muted)] hover:text-[var(--brand-mark)]">{t.text}</a>
        </li>
      ))}
    </ol>
  );
}
