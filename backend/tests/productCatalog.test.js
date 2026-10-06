const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseProduct, higherPlan } = require('../src/lib/productCatalog');

test('parseProduct prices products server-side', () => {
  assert.deepEqual(parseProduct('leads-ai:pro'), { key: 'leads-ai:pro', productId: 'leads-ai', plan: 'pro', price: 67, title: 'MBN Leads AI — Pro', name: 'MBN Leads AI' });
  assert.equal(parseProduct('leads-ai:starter').price, 37);
  assert.equal(parseProduct('leads-ai:agency').price, 97);
});

test('parseProduct rejects unknown products and plans', () => {
  for (const v of ['leads-ai:free', 'other:pro', 'leads-ai', '', null, 'leads-ai:constructor', 'leads-ai:__proto__']) {
    assert.equal(parseProduct(v), null, String(v));
  }
});

test('higherPlan never downgrades an existing licence', () => {
  assert.equal(higherPlan(null, 'starter'), 'starter');
  assert.equal(higherPlan('starter', 'pro'), 'pro');
  assert.equal(higherPlan('agency', 'starter'), 'agency');
});
