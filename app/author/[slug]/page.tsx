import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ExternalLink, Mail, MapPin } from 'lucide-react';
import BlogList from '@/components/blog/BlogList';
import { toCard } from '@/components/blog/PostCard';
import { AuthorAvatar } from '@/components/blog/AuthorBox';
import { getPublishedPosts } from '@/lib/posts';
import { AUTHOR_BIO, AUTHOR_LINKEDIN_URL, AUTHOR_LOCATION, AUTHOR_PATH, AUTHOR_PHOTO_URL, OPERATOR_NAME, SITE_URL } from '@/lib/site';

export const revalidate = 300;

// ponytail: one author, so the slug is a constant. Add an authors table when a second writer joins.
const SLUG = AUTHOR_PATH.split('/').pop()!;

interface Props {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = () => [{ slug: SLUG }];
export const dynamicParams = false;

export const metadata: Metadata = {
  title: `${OPERATOR_NAME}, Author at YT Niches`,
  description: AUTHOR_BIO,
  alternates: { canonical: `${SITE_URL}${AUTHOR_PATH}` },
};

export default async function AuthorPage({ params }: Props) {
  if ((await params).slug !== SLUG) notFound();
  const posts = await getPublishedPosts();
  const button =
    'inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] px-4 text-[14px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-accent)]';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            url: `${SITE_URL}${AUTHOR_PATH}`,
            mainEntity: {
              '@type': 'Person',
              name: OPERATOR_NAME,
              url: `${SITE_URL}${AUTHOR_PATH}`,
              image: AUTHOR_PHOTO_URL || undefined,
              description: AUTHOR_BIO,
              jobTitle: 'Founder',
              worksFor: { '@type': 'Organization', name: 'YT Niches', url: SITE_URL },
              sameAs: AUTHOR_LINKEDIN_URL ? [AUTHOR_LINKEDIN_URL] : undefined,
            },
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--text-ink)]">Home</Link>
        <span className="text-[var(--border-line-strong)]">/</span>
        <span className="font-semibold text-[var(--text-ink)]" aria-current="page">{OPERATOR_NAME}</span>
      </nav>

      <header className="mb-12 flex flex-col gap-6 rounded-3xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-6 sm:flex-row sm:items-center sm:p-8">
        <AuthorAvatar className="size-28 text-[32px]" />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold uppercase tracking-wide text-[var(--brand-mark)]">Founder of YT Niches</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-ink)] sm:text-4xl">{OPERATOR_NAME}</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--text-muted)]">{AUTHOR_BIO}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[14px] text-[var(--text-muted)]">
            <MapPin className="size-4" /> Based in {AUTHOR_LOCATION}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {AUTHOR_LINKEDIN_URL && (
              <a href={AUTHOR_LINKEDIN_URL} target="_blank" rel="noopener noreferrer me" className={button}>
                LinkedIn <ExternalLink className="size-3.5" />
              </a>
            )}
            <Link href="/contact" className={button}>
              <Mail className="size-4" /> Contact
            </Link>
          </div>
        </div>
      </header>

      <section aria-label={`Articles by ${OPERATOR_NAME}`}>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-[var(--text-ink)]">
          Articles by {OPERATOR_NAME} <span className="text-[var(--text-muted)]">({posts.length})</span>
        </h2>
        {posts.length ? (
          <BlogList posts={posts.map(toCard)} featureFirst={false} />
        ) : (
          <p className="text-[var(--text-muted)]">New articles are on the way.</p>
        )}
      </section>
    </div>
  );
}
