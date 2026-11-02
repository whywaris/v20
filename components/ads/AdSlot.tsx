'use client';

import React, { useEffect, useRef } from 'react';

export type AdFormat = 'horizontal' | 'in-feed' | 'rectangle';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// NEXT_PUBLIC_* values must be written out literally so Next.js can inline them in the browser bundle.
const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const SLOT_IDS: Record<AdFormat, string | undefined> = {
  horizontal: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HORIZONTAL,
  'in-feed': process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
};
const INFEED_LAYOUT_KEY = process.env.NEXT_PUBLIC_ADSENSE_INFEED_LAYOUT_KEY;
const IS_DEV = process.env.NODE_ENV !== 'production';

// Space reserved up front for each format, so the page never jumps when an ad loads (CLS = 0).
const RESERVED: Record<AdFormat, string> = {
  horizontal: 'min-h-[100px] sm:min-h-[90px]',
  'in-feed': 'min-h-[250px]',
  rectangle: 'min-h-[250px]',
};
const LABEL: Record<AdFormat, string> = {
  horizontal: 'Leaderboard ad',
  'in-feed': 'In-feed ad',
  rectangle: 'Rectangle ad',
};

/**
 * One responsive AdSense unit.
 * - Live (production + client ID + slot ID): renders the <ins> unit in reserved space and requests one ad.
 * - Development: a subtle outlined placeholder of the same size, so layouts can be checked.
 * - Production without IDs: renders nothing (no empty boxes for visitors; Auto ads can still run from the layout script).
 */
export default function AdSlot({ format, className = '' }: { format: AdFormat; className?: string }) {
  const slotId = SLOT_IDS[format];
  const live = !IS_DEV && !!CLIENT_ID && !!slotId;
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = insRef.current;
    // Each <ins> may be filled exactly once; AdSense marks it with data-adsbygoogle-status after a push.
    if (!live || !ins || ins.getAttribute('data-adsbygoogle-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or an unapproved site: leave the reserved space empty rather than breaking the page.
    }
  }, [live]);

  if (live) {
    const fluidInFeed = format === 'in-feed' && INFEED_LAYOUT_KEY;
    return (
      <aside aria-label="Advertisement" className={`w-full overflow-hidden ${RESERVED[format]} ${className}`}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={CLIENT_ID}
          data-ad-slot={slotId}
          {...(fluidInFeed
            ? { 'data-ad-format': 'fluid', 'data-ad-layout-key': INFEED_LAYOUT_KEY }
            : { 'data-ad-format': format === 'rectangle' ? 'rectangle' : 'auto', 'data-full-width-responsive': 'true' })}
        />
      </aside>
    );
  }

  if (!IS_DEV) return null;

  return (
    <div
      aria-hidden
      className={`w-full flex items-center justify-center rounded-xl border border-dashed border-[var(--border-line-strong)] text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] opacity-60 ${RESERVED[format]} ${className}`}
    >
      {LABEL[format]} · placeholder
    </div>
  );
}
