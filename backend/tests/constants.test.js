const { test } = require('node:test');
const assert   = require('node:assert');
const {
  PROJECT_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, ROLES, PLANS,
} = require('../src/lib/constants');

test('PROJECT_STATUS matches the documented lifecycle exactly', () => {
  assert.deepEqual(Object.values(PROJECT_STATUS), [
    'pending', 'paid', 'in-progress', 'review', 'revision', 'completed', 'cancelled',
  ]);
});

test('ORDER_STATUS has no value outside what orderGuard.js\'s state machine knows about', () => {
  const { VALID_TRANSITIONS } = require('../src/lib/orderGuard');
  for (const value of Object.values(ORDER_STATUS)) {
    assert.ok(value in VALID_TRANSITIONS, `${value} should be a known order state`);
  }
});

test('PAYMENT_STATUS has no value outside paymentGuard\'s state machine', () => {
  const { VALID_TRANSITIONS } = require('../src/lib/paymentGuardPure');
  for (const value of Object.values(PAYMENT_STATUS)) {
    assert.ok(value in VALID_TRANSITIONS, `${value} should be a known payment state`);
  }
});

test('all constant objects are frozen (no accidental runtime mutation)', () => {
  for (const obj of [PROJECT_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, ROLES, PLANS]) {
    assert.equal(Object.isFrozen(obj), true);
  }
});
