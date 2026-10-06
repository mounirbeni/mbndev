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

const { checkBusiness, placeIdFromUrl, fetchGoogleReviews } = require('../src/lib/reviewBooster/monitor');
const { draftReply } = require('../src/lib/reviewBooster/reply');

const googleReply = (reviews, count = 40, rating = 4.4) => async () => ({
  ok: true,
  json: async () => ({ id: 'ChIJtest', rating, userRatingCount: count, reviews }),
});
const gReview = (id, rating, text, publishTime = '2026-10-01T10:00:00Z') => ({
  name: `places/ChIJtest/reviews/${id}`, rating, publishTime,
  originalText: { text, languageCode: 'fr' }, authorAttribution: { displayName: `Author ${id}` },
});

function fakePrisma(existingIds = []) {
  const state = { created: [], snapshots: [], updates: [] };
  return {
    state,
    googleReview: {
      findMany: async ({ where }) => where.googleId.in.filter((g) => existingIds.includes(g)).map((googleId) => ({ googleId })),
      createMany: async ({ data }) => { state.created.push(...data); return { count: data.length }; },
    },
    reviewSnapshot: { create: async ({ data }) => { state.snapshots.push(data); return data; } },
    reviewBusiness: { update: async ({ data }) => { state.updates.push(data); return data; } },
  };
}

test('placeIdFromUrl reads the placeid of a write-review link', () => {
  assert.equal(placeIdFromUrl('https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'), 'ChIJN1t_tDeuEmsRUsoyG83frY4');
  assert.equal(placeIdFromUrl('https://g.page/r/abc/review'), null);
});

test('fetchGoogleReviews maps Google reviews and raises PlacesError on failure', async () => {
  const d = await fetchGoogleReviews('ChIJtest', 'k', googleReply([gReview('a', 5, 'Super séjour')]));
  assert.deepEqual(d.reviews[0], { googleId: 'places/ChIJtest/reviews/a', author: 'Author a', rating: 5, text: 'Super séjour', language: 'fr', publishedAt: new Date('2026-10-01T10:00:00Z') });
  await assert.rejects(fetchGoogleReviews('x', 'k', async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'API key not valid' } }) })), /API key not valid/);
});

test('checkBusiness: first check is a baseline, later checks report new reviews', async () => {
  const p1 = fakePrisma();
  const first = await checkBusiness(p1, { id: 'b1', placeId: 'ChIJtest', monitoredAt: null, ratingCount: null }, 'k', googleReply([gReview('a', 5, 'Top')]));
  assert.equal(first.newCount, 0);
  assert.equal(p1.state.created.length, 1);
  assert.equal(p1.state.snapshots[0].ratingCount, 40);

  const p2 = fakePrisma(['places/ChIJtest/reviews/a']);
  const later = await checkBusiness(p2, { id: 'b1', placeId: 'ChIJtest', monitoredAt: new Date(), ratingCount: 38, rating: 4.5 },
    'k', googleReply([gReview('a', 5, 'Top'), gReview('b', 2, 'Chambre froide')], 41));
  assert.equal(later.newCount, 3); // count went 38 → 41, more than the 1 visible new review
  assert.deepEqual(later.newReviews.map((r) => r.rating), [2]);
  assert.equal(p2.state.created.length, 1);
});

test('draftReply sends the review to OpenAI and returns the text', async () => {
  let body;
  const reply = await draftReply({
    apiKey: 'sk-test', business: { name: 'Riad Yasmine' },
    review: { author: 'Sara', rating: 2, text: 'Chambre froide', language: 'fr' },
    fetchImpl: async (url, opts) => { body = JSON.parse(opts.body); return { ok: true, json: async () => ({ choices: [{ message: { content: ' Bonjour Sara, merci… ' } }] }) }; },
  });
  assert.equal(reply, 'Bonjour Sara, merci…');
  assert.match(body.messages[0].content, /Riad Yasmine/);
  assert.match(body.messages[1].content, /Chambre froide/);
});
