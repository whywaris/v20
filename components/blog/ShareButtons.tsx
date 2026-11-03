'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/** Plain share links (no third-party scripts) plus copy link. */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    ['X', `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ];
  const btn = 'inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border-line)] px-3.5 text-[13px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-accent)]';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] text-[var(--text-muted)]">Share:</span>
      {links.map(([name, href]) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={btn}>
          {name}
        </a>
      ))}
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // clipboard blocked; the URL is still in the address bar
          }
        }}
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Link2 className="size-3.5" />} {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
