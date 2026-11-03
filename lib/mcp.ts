// Minimal read-only MCP server (Streamable HTTP, stateless JSON responses) over the public JSON data.
// Pure: the route passes the data in, so this can be tested without files or a server.
import type { Channel, Niche, VideoOutlierItem } from '@/types';
import { matchChannels } from './niche-match.ts';

export type McpData = { channels: Channel[]; niches: Niche[]; outliers: VideoOutlierItem[] };
type RpcMessage = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const PROTOCOL_VERSION = '2025-06-18';
const SITE = 'https://ytniches.com';

/** How many times its channel's average views a video got. The data's own `multiplier` is views ÷ subscribers. */
export function outlierRatio(o: { views: number }, c: { avgViews?: number } | undefined): number | null {
  return c?.avgViews ? o.views / c.avgViews : null;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const clamp = (v: unknown, max: number, dflt: number) => Math.min(max, Math.max(1, Number.isFinite(Number(v)) && v != null ? Number(v) : dflt));

const channelSummary = (c: Channel) => ({
  title: c.title,
  handle: c.handle,
  url: `${SITE}/channel/${c.slug || c.id}`,
  youtube: c.youtubeUrl,
  subscribers: c.subscribers,
  avgViews: c.avgViews,
  format: c.format,
  categories: c.categories,
  estimatedRpm: c.estimatedRpm,
  estimatedMonthlyRevenueUsd: c.estimatedMonthlyRevenueUsd,
  uploadsPerWeek: c.uploadsPerWeek,
  typicalLength: c.medianLengthFormatted,
});

const TOOLS = [
  {
    name: 'search_channels',
    description: 'Search small YouTube channels (under 250k subscribers) by keyword, category or format. Biggest first.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Matches title, handle, categories and tags' },
        category: { type: 'string', description: 'Category or tag, e.g. "Finance"' },
        format: { type: 'string', enum: ['avatar', 'faceless'] },
        limit: { type: 'number', description: '1-25, default 10' },
      },
    },
  },
  {
    name: 'get_niche',
    description: 'Benchmark RPM, saturation and the top channels for one niche, by slug (e.g. "finance", "true-crime").',
    inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] },
  },
  {
    name: 'find_outliers',
    description: "Videos that got at least 5x their channel's average views, optionally filtered by keyword.",
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number', description: '1-10, default 5' } },
    },
  },
];

function callTool(name: string, args: Record<string, unknown>, d: McpData): unknown {
  if (name === 'search_channels') {
    const q = str(args.query), cat = str(args.category), format = str(args.format);
    const has = (c: Channel, s: string) => [...(c.categories ?? []), ...(c.tags ?? [])].some((x) => x.toLowerCase().includes(s));
    const hits = d.channels.filter((c) =>
      (!q || c.title?.toLowerCase().includes(q) || c.handle?.toLowerCase().includes(q) || has(c, q)) &&
      (!cat || has(c, cat)) &&
      (format !== 'avatar' || c.format === 'avatar') &&
      (format !== 'faceless' || c.format !== 'avatar'));
    hits.sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));
    return { total: hits.length, channels: hits.slice(0, clamp(args.limit, 25, 10)).map(channelSummary) };
  }
  if (name === 'get_niche') {
    const slug = str(args.slug);
    const n = d.niches.find((x) => x.slug === slug);
    if (!n) throw new Error(`No niche with slug "${slug}"`);
    const matched = matchChannels(n, d.channels).all;
    return {
      name: n.name, url: `${SITE}/niche/${n.slug}`, rpm: n.rpm, saturation: n.saturation, demandScore: n.demandScore,
      formatRecommendation: n.formatRecommendation, channelCount: matched.length, topChannels: matched.slice(0, 10).map(channelSummary),
    };
  }
  if (name === 'find_outliers') {
    const q = str(args.query);
    const byId = new Map(d.channels.map((c) => [c.id, c]));
    // ponytail: linear scan of ~18k videos per call; index by keyword if this gets hot.
    return d.outliers
      .flatMap((o) => {
        const c = o.channelId ? byId.get(o.channelId) : undefined;
        const x = outlierRatio(o, c);
        if (!c || x == null || x < 5) return [];
        if (q && !`${o.title} ${c.title} ${(o.tags ?? []).join(' ')} ${o.category ?? ''}`.toLowerCase().includes(q)) return [];
        return [{ title: o.title, url: o.videoUrl || `https://www.youtube.com/watch?v=${o.videoId}`, views: o.views,
          channelAvgViews: c.avgViews, timesChannelAvg: Math.round(x * 10) / 10, channel: c.title, channelSubscribers: c.subscribers }];
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, clamp(args.limit, 10, 5));
  }
  throw new Error(`Unknown tool "${name}"`);
}

/** One JSON-RPC message in, one response out (null for notifications, which get no response). */
export function handleRpc(msg: RpcMessage, d: McpData): object | null {
  if (msg?.id === undefined || msg.id === null) return null;
  const ok = (result: unknown) => ({ jsonrpc: '2.0', id: msg.id, result });
  const err = (code: number, message: string) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });

  switch (msg.method) {
    case 'initialize':
      return ok({
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: 'yt-niches', version: '1.0.0' },
        instructions: 'Read-only data on small YouTube channels (under 250k subs), niche RPM benchmarks and outlier videos from ytniches.com.',
      });
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS });
    case 'tools/call': {
      const name = String(msg.params?.name ?? '');
      try {
        const result = callTool(name, (msg.params?.arguments as Record<string, unknown>) ?? {}, d);
        return ok({ content: [{ type: 'text', text: JSON.stringify(result) }] });
      } catch (e) {
        return ok({ content: [{ type: 'text', text: (e as Error).message }], isError: true });
      }
    }
    default:
      return err(-32601, `Method not found: ${msg.method}`);
  }
}
