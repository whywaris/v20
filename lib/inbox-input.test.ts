import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimited, validateMessage, validateSubmission } from './inbox-input.ts';

test('validateMessage', () => {
  const ok = validateMessage({ name: ' Ali ', email: 'ali@x.com', message: 'Hello there', subject: 'Hi' });
  assert.deepEqual(ok, { ok: true, value: { name: 'Ali', email: 'ali@x.com', subject: 'Hi', body: 'Hello there' } });
  assert.equal(validateMessage({ name: 'A', email: 'nope', message: 'Hello there' }).ok, false);
  assert.equal(validateMessage({ name: 'A', email: 'a@b.co', message: '' }).ok, false);
  const bot = validateMessage({ name: 'A', email: 'a@b.co', message: 'Hello there', website: 'spam.com' });
  assert.ok(!bot.ok && bot.spam);
});

test('validateSubmission only takes YouTube links', () => {
  const r = validateSubmission({ url: 'youtube.com/@cool', niche: 'Finance' });
  assert.ok(r.ok && r.value.channel_url === 'https://youtube.com/@cool' && r.value.suggested_niche === 'Finance');
  assert.ok(validateSubmission({ url: 'http://www.youtube.com/@x' }).ok);
  assert.equal(validateSubmission({ url: 'javascript:alert(1)' }).ok, false);
  assert.equal(validateSubmission({ url: 'https://evil.com/youtube.com/@x' }).ok, false);
  assert.equal(validateSubmission({ url: 'https://youtube.com/' }).ok, false);
  assert.equal(validateSubmission({ url: 'https://youtube.com/@x', email: 'bad' }).ok, false);
});

test('rateLimited allows a few then blocks within the window', () => {
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimited('ip1', 3, 1000, t + i), false);
  assert.equal(rateLimited('ip1', 3, 1000, t + 4), true);
  assert.equal(rateLimited('ip1', 3, 1000, t + 5000), false); // window passed
});
