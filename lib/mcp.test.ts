import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRpc, outlierRatio, type McpData } from './mcp.ts';

const d = {
  channels: [
    { id: 'a', title: 'Money Talks', handle: '@money', subscribers: 5000, avgViews: 1000, categories: ['Finance'], tags: [] },
    { id: 'b', title: 'Cozy Crime', handle: '@crime', subscribers: 9000, avgViews: 2000, categories: ['Crime'], tags: [] },
  ],
  niches: [{ name: 'Finance', slug: 'finance', rpm: { min: 14, avg: 22.5, max: 35 } }],
  outliers: [
    { videoId: 'v1', title: 'Big one', views: 8000, channelId: 'a' },
    { videoId: 'v2', title: 'Small one', views: 3000, channelId: 'b' },
  ],
} as unknown as McpData;

const call = (name: string, args = {}) => {
  const r = handleRpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }, d) as { result: { content: { text: string }[]; isError?: boolean } };
  return { ...r.result, data: r.result.isError ? null : JSON.parse(r.result.content[0].text) };
};

test('initialize, tools/list, notifications and unknown methods', () => {
  const init = handleRpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, d) as { result: { capabilities: object } };
  assert.deepEqual(init.result.capabilities, { tools: {} });
  const list = handleRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, d) as { result: { tools: { name: string }[] } };
  assert.deepEqual(list.result.tools.map((t) => t.name), ['search_channels', 'get_niche', 'find_outliers']);
  assert.equal(handleRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, d), null);
  assert.equal((handleRpc({ jsonrpc: '2.0', id: 3, method: 'nope' }, d) as { error: { code: number } }).error.code, -32601);
});

test('tools return real data and flag bad input', () => {
  assert.deepEqual(call('search_channels', { query: 'finance' }).data.channels.map((c: { handle: string }) => c.handle), ['@money']);
  assert.equal(call('get_niche', { slug: 'finance' }).data.channelCount, 1);
  assert.equal(call('get_niche', { slug: 'missing' }).isError, true);
  // v1 is 8x its channel average, v2 only 1.5x
  assert.deepEqual(call('find_outliers').data.map((o: { title: string; timesChannelAvg: number }) => [o.title, o.timesChannelAvg]), [['Big one', 8]]);
  assert.equal(outlierRatio({ views: 10 }, { avgViews: 0 }), null);
});
