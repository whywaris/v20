import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimited, validateMessage } from './inbox-input.ts';

test('validateMessage', () => {
  const ok = validateMessage({ name: ' Ali ', email: 'ali@x.com', message: 'Hello there', subject: 'Hi' });
  assert.deepEqual(ok, { ok: true, value: { name: 'Ali', email: 'ali@x.com', subject: 'Hi', body: 'Hello there' } });
  assert.equal(validateMessage({ name: 'A', email: 'nope', message: 'Hello there' }).ok, false);
  assert.equal(validateMessage({ name: 'A', email: 'a@b.co', message: '' }).ok, false);
  const bot = validateMessage({ name: 'A', email: 'a@b.co', message: 'Hello there', website: 'spam.com' });
  assert.ok(!bot.ok && bot.spam);
});

test('rateLimited allows a few then blocks within the window', () => {
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimited('ip1', 3, 1000, t + i), false);
  assert.equal(rateLimited('ip1', 3, 1000, t + 4), true);
  assert.equal(rateLimited('ip1', 3, 1000, t + 5000), false); // window passed
});
