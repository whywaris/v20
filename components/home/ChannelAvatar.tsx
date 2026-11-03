// Round channel avatar that falls back to the first letter: the image sits on top of the letter, and a failed
// image with empty alt renders nothing, so the letter shows through. Works in server components (no onError).
export default function ChannelAvatar({ title, src, className = 'size-7' }: { title: string; src?: string | null; className?: string }) {
  return (
    <span
      title={title}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-surface-2)] text-[11px] font-bold uppercase text-[var(--text-muted)] ${className}`}
    >
      <span aria-hidden>{title.trim().charAt(0) || '?'}</span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
      )}
    </span>
  );
}
