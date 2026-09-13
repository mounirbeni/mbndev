const { test } = require('node:test');
const assert   = require('node:assert');
const { assertOrderTransition, ACTIVE_PAYMENT_STATUSES } = require('../src/lib/orderGuard');

test('pending -> paid is allowed', () => {
  assert.doesNotThrow(() => assertOrderTransition('pending', 'paid'));
});

test('pending -> cancelled is allowed', () => {
  assert.doesNotThrow(() => assertOrderTransition('pending', 'cancelled'));
});

test('cancelled -> paid is rejected with 409 (regression: a cancelled order must never become "paid")', () => {
  assert.throws(() => assertOrderTransition('cancelled', 'paid'), (err) => {
    assert.equal(err.statusCode, 409);
    assert.equal(err.code, 'INVALID_TRANSITION');
    return true;
  });
});

test('paid -> cancelled is rejected (terminal state)', () => {
  assert.throws(() => assertOrderTransition('paid', 'cancelled'), (err) => {
    assert.equal(err.statusCode, 409);
    return true;
  });
});

test('paid -> pending is rejected (no going backwards)', () => {
  assert.throws(() => assertOrderTransition('paid', 'pending'));
});

test('an unknown "from" status is a 500, not a silent pass', () => {
  assert.throws(() => assertOrderTransition('bogus_status', 'paid'), (err) => {
    assert.equal(err.statusCode, 500);
    return true;
  });
});

test('ACTIVE_PAYMENT_STATUSES lists exactly the in-flight payment states', () => {
  assert.deepEqual(ACTIVE_PAYMENT_STATUSES, ['pending_verification', 'processing']);
});
