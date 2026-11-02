import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_PASSWORD = 'correct horse';
const { createSessionToken, isValidSessionToken, passwordMatches } = await import('./admin-token.ts');

test('passwordMatches', () => {
  assert.equal(passwordMatches('correct horse'), true);
  assert.equal(passwordMatches('wrong'), false);
  assert.equal(passwordMatches(undefined), false);
  assert.equal(passwordMatches(''), false);
});

test('session tokens: valid, tampered, expired, other password', () => {
  const now = Date.now();
  const { value } = createSessionToken(now);
  assert.equal(isValidSessionToken(value, now), true);
  const [expiry, sig] = value.split('.');
  assert.equal(isValidSessionToken(`${Number(expiry) + 1}.${sig}`, now), false); // extended expiry
  const flipped = sig.slice(0, -1) + (sig.endsWith('0') ? '1' : '0');
  assert.equal(isValidSessionToken(`${expiry}.${flipped}`, now), false); // forged signature
  assert.equal(isValidSessionToken(value, Number(expiry) + 1), false); // expired
  assert.equal(isValidSessionToken('authorized_2026', now), false); // old localStorage value
  assert.equal(isValidSessionToken(undefined, now), false);
  process.env.ADMIN_PASSWORD = 'changed';
  assert.equal(isValidSessionToken(value, now), false); // password change logs everyone out
  process.env.ADMIN_PASSWORD = '';
  assert.equal(passwordMatches(''), false); // unset password never matches
  process.env.ADMIN_PASSWORD = 'correct horse';
});
