const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseProduct, higherPlan } = require('../src/lib/productCatalog');

test('parseProduct prices products server-side', () => {
  const pro = parseProduct('leads-ai:pro');
  assert.deepEqual([pro.key, pro.price, pro.title, pro.model, pro.path], ['leads-ai:pro', 67, 'MBN Leads AI — Pro', 'leadsAiAccount', '/leads-ai']);
  assert.equal(parseProduct('local-growth:agency').model, 'localGrowthAccount');
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
