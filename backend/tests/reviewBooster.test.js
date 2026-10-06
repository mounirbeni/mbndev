const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeReviewUrl } = require('../src/lib/reviewBooster/link');

test('normalizeReviewUrl turns a Place ID into a write-review link', () => {
  assert.equal(
    normalizeReviewUrl('ChIJN1t_tDeuEmsRUsoyG83frY4'),
    'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  );
});

test('normalizeReviewUrl accepts Google review / Maps links and forces https', () => {
  assert.equal(normalizeReviewUrl('https://g.page/r/CabcDEF123/review'), 'https://g.page/r/CabcDEF123/review');
  assert.equal(normalizeReviewUrl('maps.app.goo.gl/AbC123'), 'https://maps.app.goo.gl/AbC123');
  assert.equal(normalizeReviewUrl('http://www.google.com/maps/place/x'), 'https://www.google.com/maps/place/x');
  assert.ok(normalizeReviewUrl('https://www.google.co.ma/search?q=riad'));
  assert.ok(normalizeReviewUrl('https://www.google.fr/maps'));
  assert.ok(normalizeReviewUrl('https://www.google.com.br/maps'));
});

test('normalizeReviewUrl rejects anything that is not Google', () => {
  for (const bad of ['', 'hello', 'https://evil.com/review', 'https://google.com.evil.com/x', 'https://google.ev.co/x', 'javascript:alert(1)', 'https://notgoogle.com']) {
    assert.equal(normalizeReviewUrl(bad), null, bad);
  }
});
