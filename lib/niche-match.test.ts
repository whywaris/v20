import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isExactMatch, isKeywordMatch, keywords, matchChannels, matchOutliers, relatedNiches } from './niche-match.ts';

const ch = (handle: string, subscribers: number, extra: { title?: string; categories?: string[]; tags?: string[] } = {}) =>
  ({ handle, subscribers, title: extra.title ?? handle, categories: extra.categories ?? [], tags: extra.tags ?? [] });

test('keywords drop stop words and short words', () => {
  assert.deepEqual(keywords('Myths and Folktales'), ['myths', 'folktales']);
  assert.deepEqual(keywords('AI'), []);
});

test('exact match by category name or slug, keyword match by whole words', () => {
  const niche = { name: 'True Crime', slug: 'true-crime' };
  assert.equal(isExactMatch(ch('a', 1, { categories: ['True Crime'] }), niche), true);
  assert.equal(isExactMatch(ch('a', 1, { tags: ['true-crime'] }), niche), true);
  assert.equal(isExactMatch(ch('a', 1, { categories: ['Crime'] }), niche), false);
  assert.equal(isKeywordMatch(ch('a', 1, { title: 'Untold Crime Stories', tags: ['true'] }), niche), true);
  assert.equal(isKeywordMatch(ch('a', 1, { title: 'Crime Daily' }), niche), false); // "true" missing
  assert.equal(isKeywordMatch(ch('a', 1, { title: 'Crimes of history' }), { name: 'Crime', slug: 'crime' }), false); // whole words only
});

test('matchChannels: exact first, keyword only when few, sorted, no random fallback', () => {
  const niche = { name: 'Space Science', slug: 'space-science' };
  const channels = [
    ch('big-exact', 900, { categories: ['Space Science'] }),
    ch('small-exact', 10, { categories: ['space science'] }),
    ch('keyword', 500, { title: 'Science of Space' }),
    ch('unrelated', 99999, { categories: ['Cooking'] }),
  ];
  const r = matchChannels(niche, channels);
  assert.deepEqual(r.exact.map((c) => c.handle), ['big-exact', 'small-exact']);
  assert.deepEqual(r.related.map((c) => c.handle), ['keyword']);
  assert.equal(r.all.some((c) => c.handle === 'unrelated'), false);
  assert.deepEqual(matchChannels({ name: 'Underwater Basket Weaving', slug: 'x' }, channels).all, []);
});

test('matchChannels skips keyword matches when there are enough exact ones', () => {
  const niche = { name: 'History', slug: 'history' };
  const many = Array.from({ length: 6 }, (_, i) => ch(`h${i}`, i, { categories: ['History'] }));
  const r = matchChannels(niche, [...many, ch('kw', 1000, { title: 'History Shorts' })]);
  assert.equal(r.exact.length, 6);
  assert.equal(r.related.length, 0);
});

test('matchOutliers uses the matched channels and sorts by multiplier', () => {
  const out = [
    { channelHandle: '@a', multiplier: 2 },
    { channelHandle: '@b', multiplier: 9 },
    { channelHandle: '@zzz', multiplier: 50 },
    { channelId: 'c', multiplier: 5 },
  ];
  const r = matchOutliers({ name: 'X', slug: 'x' }, out, [ch('@a', 1), ch('b', 1), ch('C', 1)]);
  assert.deepEqual(r.map((o) => o.multiplier), [9, 5, 2]);
});

test('relatedNiches shares a keyword and excludes itself', () => {
  const ns = [
    { name: 'Space Science', slug: 'space-science', channelCount: 5 },
    { name: 'Science', slug: 'science', channelCount: 50 },
    { name: 'Space Travel', slug: 'space-travel', channelCount: 9 },
    { name: 'Cooking', slug: 'cooking', channelCount: 500 },
  ];
  assert.deepEqual(relatedNiches(ns[0], ns).map((n) => n.slug), ['science', 'space-travel']);
});
