import { NextRequest, NextResponse } from 'next/server';
import { handleRpc, type McpData } from '@/lib/mcp';
import { readData } from '@/lib/sitemap';

// Public, read-only data, so any client may call it.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
};

let data: McpData | null = null;
const load = () => (data ??= {
  channels: readData('unified_channels.json'),
  niches: readData('unified_niches.json'),
  outliers: readData('unified_outliers.json'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: CORS });
  }
  const d = load();
  const replies = (Array.isArray(body) ? body : [body]).map((m) => handleRpc(m, d)).filter(Boolean);
  if (!replies.length) return new Response(null, { status: 202, headers: CORS });
  return NextResponse.json(Array.isArray(body) ? replies : replies[0], { headers: CORS });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Stateless server: no SSE stream and no sessions to end.
const notAllowed = () => new Response('Method Not Allowed', { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } });
export { notAllowed as GET, notAllowed as DELETE };
