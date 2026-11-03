import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: string;
  coverImage: string;
};

/** Article card used on /blog, category pages and "related articles". `featured` is the large first card. */
export default function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  return (
    <article
      className={`group flex overflow-hidden rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`relative block shrink-0 overflow-hidden bg-[var(--bg-surface-2)] ${featured ? 'aspect-[16/9] md:aspect-auto md:w-[55%]' : 'aspect-[16/9]'}`}
        tabIndex={-1}
        aria-hidden
      >
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" loading={featured ? 'eager' : 'lazy'} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--brand-accent)]/25 to-amber-400/10 px-6 text-center text-lg font-bold text-[var(--text-ink)]">
            {post.category}
          </span>
        )}
      </Link>
      <div className={`flex flex-1 flex-col ${featured ? 'p-6 sm:p-8 md:justify-center' : 'p-5'}`}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--text-muted)]">
          <Link href={`/blog/category/${post.categorySlug}`} className="rounded-full bg-[var(--brand-accent)]/10 px-2.5 py-0.5 font-semibold text-[var(--brand-mark)] hover:bg-[var(--brand-accent)]/20">
            {post.category}
          </Link>
          <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {post.date}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {post.readTime}</span>
        </div>
        <h2 className={`font-bold leading-snug tracking-tight text-[var(--text-ink)] group-hover:text-[var(--brand-mark)] ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && (
          <p className={`mt-2 leading-relaxed text-[var(--text-muted)] ${featured ? 'text-[15px] line-clamp-4' : 'text-[14px] line-clamp-3'}`}>{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}

export const toCard = (p: PostCardData): PostCardData => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  categorySlug: p.categorySlug,
  date: p.date,
  readTime: p.readTime,
  coverImage: p.coverImage,
});
