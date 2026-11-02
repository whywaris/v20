'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
  badge?: string;
}

interface NicheFaqAccordionProps {
  nicheName: string;
  items: FaqItem[];
}

export default function NicheFaqAccordion({ nicheName, items }: NicheFaqAccordionProps) {
  // First item open by default
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="my-14 pt-8 border-t border-[var(--border-line)]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand-accent)]/10 text-[var(--brand-mark)] border border-[var(--brand-accent)]/20 mb-2">
          <HelpCircle className="size-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)] tracking-tight">
          Everything You Need to Know About {nicheName} on YouTube
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl">
          Data-backed answers on monetization benchmarks, production stacks, and channel competition derived from over 6,800+ tracked YouTube creators.
        </p>
      </div>

      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'glass border-[var(--brand-mark)]/40 shadow-sm'
                  : 'bg-[var(--bg-surface)] border-[var(--border-line)] hover:border-[var(--border-line-strong)]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono mt-0.5 shrink-0 ${
                    isOpen
                      ? 'bg-[var(--brand-accent)] text-[var(--brand-accent-text)]'
                      : 'bg-[var(--bg-surface-2)] text-[var(--text-muted)] border border-[var(--border-line)]'
                  }`}>
                    Q{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[15.5px] sm:text-[16.5px] font-bold text-[var(--text-ink)] leading-snug block">
                      {item.question}
                    </span>
                    {item.badge && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-500">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-1.5 rounded-full bg-[var(--bg-surface-2)] border border-[var(--border-line)] text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[var(--brand-mark)] bg-[var(--brand-accent)]/10 border-[var(--brand-accent)]/30' : ''
                }`}>
                  <ChevronDown className="size-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-[14px] sm:text-[14.5px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-line)]/50 bg-[var(--bg-surface-2)]/30">
                  <div className="pt-3 prose prose-invert max-w-none">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
