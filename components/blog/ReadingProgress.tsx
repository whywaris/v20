'use client';

import { useEffect, useState } from 'react';

/** Thin bar under the header showing how far through the article the reader is. */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setPct(total > 0 ? Math.min(100, Math.max(0, (-r.top / total) * 100)) : 100);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetId]);
  return (
    <div aria-hidden className="fixed inset-x-0 top-14 z-40 h-0.5 bg-transparent">
      <div className="h-full bg-[var(--brand-accent)] transition-[width] duration-75" style={{ width: `${pct}%` }} />
    </div>
  );
}
