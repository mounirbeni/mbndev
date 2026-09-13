const { test } = require('node:test');
const assert   = require('node:assert');
const { assertTransition, isHighRisk, isFlagged, isExpired, PAYMENT_TTL_MS } = require('../src/lib/paymentGuardPure');

test('pending -> pending_verification is allowed (normal submission)', () => {
  assert.doesNotThrow(() => assertTransition('pending', 'pending_verification'));
});

test('pending_verification -> processing is allowed (admin starts approval)', () => {
  assert.doesNotThrow(() => assertTransition('pending_verification', 'processing'));
});

test('processing -> paid is allowed (approval completes)', () => {
  assert.doesNotThrow(() => assertTransition('processing', 'paid'));
});

test('processing -> pending_verification is allowed (rollback after a failed approval transaction)', () => {
  assert.doesNotThrow(() => assertTransition('processing', 'pending_verification'));
});

test('paid -> paid is rejected — a payment cannot be approved twice', () => {
  assert.throws(() => assertTransition('paid', 'paid'), (err) => {
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'INVALID_TRANSITION');
    return true;
  });
});

test('paid -> processing is rejected — cannot re-approve an already-paid payment', () => {
  assert.throws(() => assertTransition('paid', 'processing'), (err) => {
    assert.equal(err.statusCode, 409);
    return true;
  });
});

test('failed and refunded are terminal states', () => {
  assert.throws(() => assertTransition('failed', 'paid'));
  assert.throws(() => assertTransition('refunded', 'paid'));
});

test('isHighRisk / isFlagged thresholds', () => {
  assert.equal(isFlagged(59), false);
  assert.equal(isFlagged(60), true);
  assert.equal(isHighRisk(79), false);
  assert.equal(isHighRisk(80), true);
});

test('isExpired is true once expiresAt has passed', () => {
  assert.equal(isExpired({ expiresAt: new Date(Date.now() - 1000) }), true);
  assert.equal(isExpired({ expiresAt: new Date(Date.now() + PAYMENT_TTL_MS) }), false);
  assert.equal(!!isExpired({ expiresAt: null }), false);
});
