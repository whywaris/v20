import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWhitelistedGoogleAdmin } from './admin-token.ts';

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
