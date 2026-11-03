'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ArrowRight, Wand2, Plug } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

const MCP_COMMAND = `claude mcp add --transport http yt-niches ${SITE_URL}/api/mcp`;

export default function CreatorToolkit() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context): the command is still selectable.
    }
  };

  return (
    <section className="mt-16 grid gap-5 lg:grid-cols-2" aria-label="Creator toolkit">
      <div className="flex min-w-0 flex-col rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--brand-accent)]/10 px-2.5 py-1 text-[12px] font-bold text-[var(--brand-mark)]">
          <Plug className="size-3.5" /> Free API &amp; MCP
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[var(--text-ink)]">Connect YT Niches to Claude AI</h2>
        <p className="mt-2 text-[14px] text-[var(--text-muted)]">
          Add our niche and channel database as an MCP connector, then ask Claude about small viral channels, RPM rates and outlier videos.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface-2)] p-2 pl-3">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[12.5px] text-[var(--text-ink)]">{MCP_COMMAND}</code>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy command"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] font-semibold text-[var(--text-ink)] hover:border-[var(--brand-mark)]"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <Link href="/mcp" className="mt-4 text-[13px] font-semibold text-[var(--brand-mark)] hover:underline">
          Setup Guide for Claude Desktop &amp; REST API →
        </Link>
      </div>

      <div className="flex min-w-0 flex-col rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
          <Wand2 className="size-3.5" /> Recommended Tools
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[var(--text-ink)]">Launch Faceless &amp; AI Avatar Channels in Minutes</h2>
        <p className="mt-2 mb-5 text-[14px] text-[var(--text-muted)]">
          Generate scripts, AI voiceovers and auto-captioned video pipelines using top creator tools.
        </p>
        <Link href="/blog" className="btn-accent mt-auto inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-[14px]">
          Explore Top Creator Tools <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
