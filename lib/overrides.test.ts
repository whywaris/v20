import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOverrides, type Override } from './overrides.ts';

const items = [
  { id: 'a', title: 'A', subs: 1 },
  { id: 'b', title: 'B', subs: 2 },
  { id: 'c', title: 'C', subs: 3 },
];
const o = (key: string, data: Record<string, unknown>, hidden = false): Override => ({ kind: 'channel', key, data, hidden });

test('applyOverrides edits, hides and adds while keeping order', () => {
  const out = applyOverrides(items, [o('b', { title: 'B2' }), o('c', {}, true), o('new', { id: 'new', title: 'N', subs: 9 })], (i) => i.id);
  assert.deepEqual(out, [
    { id: 'a', title: 'A', subs: 1 },
    { id: 'b', title: 'B2', subs: 2 },
    { id: 'new', title: 'N', subs: 9 },
  ]);
  assert.equal(items[1].title, 'B', 'base items are not mutated');
});

test('applyOverrides ignores empty or hidden new items and returns the same list with no overrides', () => {
  assert.equal(applyOverrides(items, [], (i) => i.id), items);
  assert.equal(applyOverrides(items, [o('x', {}), o('y', { id: 'y' }, true)], (i) => i.id).length, 3);
});
