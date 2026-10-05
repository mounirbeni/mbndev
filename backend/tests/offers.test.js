const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';
const { issueOffer, verifyOffer, applyDiscount } = require('../src/lib/offers');

beforeEach(() => {
  delete process.env.OFFER_MIN_PCT;
  delete process.env.OFFER_MAX_PCT;
  delete process.env.OFFER_TTL_HOURS;
});

test('issued offers stay within the configured range and verify', () => {
  for (let i = 0; i < 200; i++) {
    const offer = issueOffer();
    assert.ok(offer.pct >= 5 && offer.pct <= 15, `pct ${offer.pct} out of range`);
    assert.equal(verifyOffer(offer.token), offer.pct);
  }
});

test('expiry follows OFFER_TTL_HOURS', () => {
  process.env.OFFER_TTL_HOURS = '24';
  const offer = issueOffer();
  const hours = (new Date(offer.expiresAt) - Date.now()) / 3_600_000;
  assert.ok(hours > 23.9 && hours <= 24, `ttl ${hours}h`);
});

test('tampered, foreign, expired or missing tokens give no discount', () => {
  const { token } = issueOffer();
  assert.equal(verifyOffer(token.slice(0, -2) + 'xx'), 0);
  assert.equal(verifyOffer(jwt.sign({ typ: 'offer', pct: 40 }, 'other-secret')), 0);
  assert.equal(verifyOffer(jwt.sign({ id: 'user' }, 'test-secret')), 0);
  assert.equal(verifyOffer(jwt.sign({ typ: 'offer', pct: 10 }, 'test-secret', { expiresIn: -10 })), 0);
  assert.equal(verifyOffer(undefined), 0);
});

test('a valid token never exceeds the current ceiling', () => {
  const token = jwt.sign({ typ: 'offer', pct: 30 }, 'test-secret', { expiresIn: '1h' });
  assert.equal(verifyOffer(token), 15);
});

test('offers can be disabled with OFFER_MAX_PCT=0', () => {
  process.env.OFFER_MIN_PCT = '0';
  process.env.OFFER_MAX_PCT = '0';
  assert.equal(issueOffer(), null);
});

test('applyDiscount rounds to whole dollars', () => {
  assert.equal(applyDiscount(1290, 12), 1135);
  assert.equal(applyDiscount(1290, 0), 1290);
});
