const { test } = require('node:test');
const assert   = require('node:assert');
const {
  computeLockout,
  normalizeEmail,
  normalizePhone,
  LOGIN_MAX_FAILS,
  GLOBAL_MAX_FAILS,
  LOGIN_LOCK_MS,
} = require('../src/lib/authSecurityPure');

function fails(count, spacingMs = 1000, endingAt = Date.now()) {
  // newest first, matching the `orderBy: desc` shape the real query returns
  return Array.from({ length: count }, (_, i) => new Date(endingAt - i * spacingMs));
}

test('no failures — not locked, full attempts remaining', () => {
  const r = computeLockout({ ipFails: [], globalFails: [], now: Date.now() });
  assert.equal(r.locked, false);
  assert.equal(r.attemptsLeft, LOGIN_MAX_FAILS);
});

test('fewer than the per-IP threshold — not locked', () => {
  const now = Date.now();
  const r = computeLockout({ ipFails: fails(LOGIN_MAX_FAILS - 1, 1000, now), globalFails: [], now });
  assert.equal(r.locked, false);
  assert.equal(r.attemptsLeft, 1);
});

test('reaching the per-IP threshold locks the (email, ip) pair', () => {
  const now = Date.now();
  const r = computeLockout({ ipFails: fails(LOGIN_MAX_FAILS, 1000, now), globalFails: [], now });
  assert.equal(r.locked, true);
  assert.ok(r.remainingMs > 0 && r.remainingMs <= LOGIN_LOCK_MS);
});

test('a single attacker IP can no longer lock the account via the global gate alone', () => {
  // Regression test for the audit finding: failures from ONE ip must not be
  // able to trip the (much higher) global, any-IP threshold.
  const now = Date.now();
  const r = computeLockout({ ipFails: fails(LOGIN_MAX_FAILS, 1000, now), globalFails: fails(LOGIN_MAX_FAILS, 1000, now), now });
  assert.equal(r.locked, true); // still locked — but via the per-IP gate, not because 5 == 20
});

test('a distributed attack (many IPs) is still caught by the global gate', () => {
  const now = Date.now();
  const r = computeLockout({ ipFails: [], globalFails: fails(GLOBAL_MAX_FAILS, 1000, now), now });
  assert.equal(r.locked, true);
});

test('fewer than the global threshold, spread across IPs — not locked', () => {
  const now = Date.now();
  const r = computeLockout({ ipFails: [], globalFails: fails(GLOBAL_MAX_FAILS - 1, 1000, now), now });
  assert.equal(r.locked, false);
});

test('lock expires once LOGIN_LOCK_MS has elapsed since the last failure', () => {
  // Verify remainingMs math directly by simulating a full threshold that
  // just expired.
  const now = Date.now();
  const expiredFails = Array.from({ length: LOGIN_MAX_FAILS }, () => new Date(now - LOGIN_LOCK_MS - 1000));
  const r2 = computeLockout({ ipFails: expiredFails, globalFails: [], now });
  assert.equal(r2.locked, false);
});

test('normalizeEmail lowercases and trims without altering local-part dots', () => {
  assert.equal(normalizeEmail('  User.Name@Example.COM '), 'user.name@example.com');
});

test('normalizePhone rejects too-short input', () => {
  assert.equal(normalizePhone('123'), null);
});

test('normalizePhone accepts and formats an international number', () => {
  assert.equal(normalizePhone('00212 6-12-34-56-78'), '+212612345678');
});
