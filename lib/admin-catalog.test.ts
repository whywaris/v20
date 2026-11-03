import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminView, cleanChannelEdit, cleanNicheEdit, newChannel, newNiche } from './admin-catalog.ts';

test('cleanChannelEdit keeps only allowed, valid fields', () => {
  assert.deepEqual(
    cleanChannelEdit({ title: ' New ', subscribers: '1200', avgViews: -5, format: 'hacker', monetization: true, categories: 'Finance, Money,', id: 'evil', thumbnail: 'javascript:x' }),
    { title: 'New', subscribers: 1200, monetization: true, categories: ['Finance', 'Money'] }
  );
  assert.deepEqual(cleanChannelEdit({ handle: 'abc' }), { handle: '@abc' });
});

test('newChannel and newNiche require their key fields', () => {
  assert.ok('error' in newChannel({ title: 'X' }));
  const c = newChannel({ title: 'Cool', handle: '@Cool.Channel' });
  assert.ok(!('error' in c) && c.id === 'cool.channel' && (c.data.categories as string[])[0] === 'General');
  assert.ok('error' in newNiche({}));
  const n = newNiche({ name: 'Stocks & Crypto', rpmAvg: 20 });
  assert.ok(!('error' in n) && n.slug === 'stocks-and-crypto' && (n.data.rpm as { avg: number }).avg === 20);
});

test('cleanNicheEdit merges partial RPM and caps demand score', () => {
  assert.deepEqual(cleanNicheEdit({ rpmAvg: '9', demandScore: 42 }, { min: 4, avg: 8, max: 14 }), { demandScore: 10, rpm: { min: 4, avg: 9, max: 14 } });
});

test('adminView tags edited, hidden and new items and keeps hidden ones visible', () => {
  const items = [{ id: 'a', t: 1 }, { id: 'b', t: 2 }];
  const view = adminView(
    items,
    [
      { kind: 'channel', key: 'a', data: { t: 9 }, hidden: false },
      { kind: 'channel', key: 'b', data: {}, hidden: true },
      { kind: 'channel', key: 'n', data: { id: 'n', t: 3 }, hidden: false },
    ],
    (i) => i.id
  );
  assert.deepEqual(view.map((v) => [v.id, v.t, v._status]), [['n', 3, 'new'], ['a', 9, 'edited'], ['b', 2, 'hidden']]);
});
