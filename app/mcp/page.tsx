import React from 'react';
import { Metadata } from 'next';
import { Plug } from 'lucide-react';
import { LegalPage, Section } from '@/components/layout/LegalPage';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Free MCP Server & API · Use YT Niches in Claude',
  description:
    'Connect the YT Niches database to Claude with a free, read-only MCP server: search small YouTube channels, niche RPM benchmarks and outlier videos.',
  alternates: { canonical: `${SITE_URL}/mcp` },
};

const ENDPOINT = `${SITE_URL}/api/mcp`;

const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface-2)] p-4 text-[13px] text-[var(--text-ink)]">
    <code>{children}</code>
  </pre>
);

export default function McpPage() {
  return (
    <LegalPage icon={Plug} badge="Free API & MCP" title="Use YT Niches in Claude" subtitle="Free, read-only, no API key.">
      <Section title="Claude Code">
        <p>Run this once in your terminal:</p>
        <Code>{`claude mcp add --transport http yt-niches ${ENDPOINT}`}</Code>
      </Section>

      <Section title="Claude Desktop">
        <p>
          Open <strong>Settings → Connectors → Add custom connector</strong> and paste <code>{ENDPOINT}</code>. Or add this to{' '}
          <code>claude_desktop_config.json</code>:
        </p>
        <Code>{JSON.stringify({ mcpServers: { 'yt-niches': { command: 'npx', args: ['mcp-remote', ENDPOINT] } } }, null, 2)}</Code>
      </Section>

      <Section title="Tools">
        <ul>
          <li><strong>search_channels</strong>: find small channels (under 250k subs) by keyword, category or format.</li>
          <li><strong>get_niche</strong>: RPM range, saturation and top channels for a niche slug such as <code>finance</code>.</li>
          <li><strong>find_outliers</strong>: videos that got 5x or more their channel&apos;s average views.</li>
        </ul>
        <p>Try asking Claude: &ldquo;Find faceless finance channels under 50k subs and show their best outlier videos.&rdquo;</p>
      </Section>

      <Section title="Plain HTTP (JSON-RPC)">
        <p>The endpoint speaks MCP&apos;s Streamable HTTP transport, so you can also call it directly:</p>
        <Code>{`curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_niche","arguments":{"slug":"finance"}}}'`}</Code>
        <p>Figures are estimates from public data. Please keep request volumes reasonable.</p>
      </Section>
    </LegalPage>
  );
}
