import Link from 'next/link';
import { AUTHOR_BIO, AUTHOR_LINKEDIN_URL, AUTHOR_PHOTO_URL, OPERATOR_NAME } from '@/lib/site';

const initials = OPERATOR_NAME.split(' ').map((w) => w[0]).join('');

/** Author photo (or initials until a photo URL is set). */
export function AuthorAvatar({ className = 'size-12 text-[15px]' }: { className?: string }) {
  return AUTHOR_PHOTO_URL ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={AUTHOR_PHOTO_URL} alt={OPERATOR_NAME} className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] font-bold text-white ${className}`}>
      {initials}
    </span>
  );
}

/** "About the author" box used under every article and on the About page. */
export default function AuthorBox({ heading = 'Written by' }: { heading?: string }) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-5 sm:flex-row sm:items-center">
      <AuthorAvatar />
      <div className="flex-1">
        <div className="text-[13px] text-[var(--text-muted)]">{heading}</div>
        <div className="font-bold text-[var(--text-ink)]">{OPERATOR_NAME}</div>
        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          {AUTHOR_BIO}{' '}
          <Link href="/about" className="font-semibold text-[var(--brand-mark)] hover:underline">About us</Link>
          {AUTHOR_LINKEDIN_URL && (
            <>
              {' · '}
              <a href={AUTHOR_LINKEDIN_URL} target="_blank" rel="noopener noreferrer me" className="font-semibold text-[var(--brand-mark)] hover:underline">LinkedIn</a>
            </>
          )}
        </p>
      </div>
    </aside>
  );
}
