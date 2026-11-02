import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_PASSWORD = 'correct horse';
const { createSessionToken, isValidSessionToken, passwordMatches, isWhitelistedGoogleAdmin } = await import('./admin-token.ts');

test('ADMIN_EMAILS only accepts a matching Google identity', () => {
  const list = ' Boss@Gmail.com , other@x.com ';
  const google = (email: string) => ({ provider: 'google', identity_data: { email } });
  const emailLogin = (email: string) => ({ provider: 'email', identity_data: { email } });
  assert.equal(isWhitelistedGoogleAdmin({ identities: [google('boss@gmail.com')] }, list), true);
  assert.equal(isWhitelistedGoogleAdmin({ identities: [google('BOSS@gmail.com ')] }, list), true); // case/space-insensitive
  assert.equal(isWhitelistedGoogleAdmin({ identities: [emailLogin('boss@gmail.com')] }, list), false); // password sign-up
  assert.equal(isWhitelistedGoogleAdmin({ identities: [google('stranger@gmail.com')] }, list), false);
  assert.equal(isWhitelistedGoogleAdmin({ identities: [google('boss@gmail.com')] }, ''), false); // no list
  assert.equal(isWhitelistedGoogleAdmin({ identities: [] }, list), false);
  assert.equal(isWhitelistedGoogleAdmin({ identities: null }, list), false);
  assert.equal(isWhitelistedGoogleAdmin({ identities: [{ provider: 'google', identity_data: {} }] }, list), false);
});

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
