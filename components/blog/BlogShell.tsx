import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

type Category = { name: string; slug: string; count: number };

/** Header, breadcrumb and category chips shared by /blog and /blog/category/[slug]. */
export default function BlogShell({
  title,
  description,
  categories,
  activeSlug,
  crumbs,
  children,
}: {
  title: string;
  description: string;
  categories: Category[];
  activeSlug?: string;
  crumbs: { name: string; href: string }[];
  children: React.ReactNode;
}) {
  const all = [{ name: 'Home', href: '/' }, ...crumbs];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href === '/' ? '/' : c.href}` })),
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        {all.map((c, i) => (
          <span key={c.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-[var(--border-line-strong)]">/</span>}
            {i === all.length - 1 ? (
              <span className="font-semibold text-[var(--text-ink)]" aria-current="page">{c.name}</span>
            ) : (
              <Link href={c.href} className="hover:text-[var(--text-ink)]">{c.name}</Link>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 py-1 text-[12px] font-semibold text-[var(--text-muted)]">
          <BookOpen className="size-3.5 text-[var(--brand-mark)]" /> YT Niches Blog
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-ink)] sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[16px] text-[var(--text-muted)]">{description}</p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Blog categories" className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${!activeSlug ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-ink)]'}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${activeSlug === c.slug ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-ink)]'}`}
            >
              {c.name} <span className="opacity-60">{c.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {children}
    </div>
  );
}
