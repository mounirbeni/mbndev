const test = require('node:test');
const assert = require('node:assert/strict');
const { calculatePrice, PACKAGE_INCLUSIONS } = require('../src/lib/pricing');

test('each standard package has a finite positive authoritative checkout price', () => {
  for (const [slug, pkg] of Object.entries(PACKAGE_INCLUSIONS)) {
    assert.ok(Number.isFinite(pkg.price) && pkg.price > 0, `${slug}: price must be positive`);
    const quote = calculatePrice({ serviceType: 'website', plan: slug, pages: pkg.includedPages, features: [], addons: [] });
    assert.equal(quote.totalPrice, pkg.price, `${slug}: checkout base and package price must match`);
    assert.equal(quote.breakdown.plan, slug);
  }
});

test('checkout pricing remains server-authoritative when add-ons are selected', () => {
  const pkg = PACKAGE_INCLUSIONS.starter;
  const quote = calculatePrice({ serviceType: 'website', plan: 'starter', pages: pkg.includedPages + 1, features: [], addons: [] });
  assert.ok(quote.totalPrice > pkg.price);
});
