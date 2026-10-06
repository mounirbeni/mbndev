const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fetchPlace, findCompetitors, buildReport } = require('../src/lib/localGrowth/report');

const NOW = new Date('2026-10-06T00:00:00Z');
const daysAgo = (n) => new Date(NOW - n * 86400000).toISOString();

const basePlace = {
  placeId: 'me', name: 'Riad Test', address: 'Medina', type: 'lodging', typeLabel: 'Riad',
  rating: 4.2, reviews: 30, website: 'https://riadtest.example', phone: '+212 600', hasHours: true,
  photos: 2, lastReviewAt: daysAgo(200), mapsUrl: null, location: { latitude: 31.6, longitude: -8 },
};
const competitors = [
  { placeId: 'a', name: 'A', rating: 4.8, reviews: 400, website: 'https://a.example' },
  { placeId: 'b', name: 'B', rating: 4.6, reviews: 150, website: null },
  { placeId: 'c', name: 'C', rating: 4.7, reviews: 90, website: 'https://c.example' },
];
const weakAudit = { hasWebsite: true, reachable: true, https: false, mobileFriendly: false, responseMs: 900, outdatedSignals: [], hasBooking: false, thirdPartyBookingOnly: true, hasMetaDescription: true, title: 'x', hasContactForm: true, emails: [], social: {} };

test('weak riad vs strong competitors: low scores and the right priorities', () => {
  const r = buildReport({ place: basePlace, competitors, audit: weakAudit, now: NOW });
  assert.deepEqual(r.benchmark, { competitors: 3, medianReviews: 150, avgRating: 4.7, withWebsite: 2 });
  // rating 4.2 → 32, reviews 30/150 = 0.2 → 6
  assert.equal(r.scores.reputation, 38);
  // audit opportunity 20+15+12 = 47 → website 53
  assert.equal(r.scores.website, 53);
  // website 25 + phone 20 + hours 20 + photos(2) 10 + stale review 0
  assert.equal(r.scores.profile, 75);
  assert.equal(r.scores.overall, Math.round(0.4 * 38 + 0.35 * 53 + 0.25 * 75));
  const titles = r.actions.map((a) => a.title);
  assert.ok(titles.includes('Make the website mobile-friendly'));
  assert.ok(titles.includes('Take direct bookings'));
  assert.ok(titles.includes('Collect more Google reviews'));
  assert.ok(titles.includes('Lift your rating'));
  assert.ok(titles.includes('Get fresh reviews'));
  assert.ok(titles.includes('Link your social profiles'));
  assert.match(r.actions.find((a) => a.title === 'Collect more Google reviews').detail, /\+120/);
  // high before medium before low
  const rank = { high: 0, medium: 1, low: 2 };
  assert.ok(r.actions.every((a, i) => i === 0 || rank[r.actions[i - 1].priority] <= rank[a.priority]));
});

test('no website and no competitors still produces a useful report', () => {
  const place = { ...basePlace, website: null, phone: null, hasHours: false, photos: 0, reviews: 12, rating: 4.9, lastReviewAt: daysAgo(10) };
  const r = buildReport({ place, competitors: [], audit: { hasWebsite: false }, now: NOW });
  assert.equal(r.scores.website, 5);
  assert.equal(r.scores.reputation, 50 + 16);
  assert.equal(r.scores.profile, 15);
  assert.equal(r.actions[0].title, 'Get a website that converts');
  assert.ok(r.actions.some((a) => a.title === 'Add opening hours to Google'));
  assert.ok(!r.actions.some((a) => a.title === 'Get fresh reviews'));
});

test('fetchPlace normalises the Google profile', async () => {
  const fetchImpl = async (url, init) => {
    assert.match(url, /places\/abc$/);
    assert.equal(init.headers['X-Goog-Api-Key'], 'KEY');
    return new Response(JSON.stringify({
      id: 'abc', displayName: { text: 'Riad X' }, primaryType: 'lodging', primaryTypeDisplayName: { text: 'Hotel' },
      rating: 4.5, userRatingCount: 88, websiteUri: 'https://x.example', location: { latitude: 1, longitude: 2 },
      regularOpeningHours: { weekdayDescriptions: [] }, photos: [{}, {}, {}],
      reviews: [{ rating: 5, publishTime: '2026-09-01T10:00:00Z' }, { rating: 3, publishTime: '2026-07-01T10:00:00Z' }],
    }), { status: 200 });
  };
  const p = await fetchPlace('abc', 'KEY', fetchImpl);
  assert.equal(p.name, 'Riad X');
  assert.equal(p.type, 'lodging');
  assert.equal(p.reviews, 88);
  assert.equal(p.photos, 3);
  assert.equal(p.hasHours, true);
  assert.equal(p.lastReviewAt, '2026-09-01T10:00:00.000Z');
});

test('findCompetitors drops the business itself and closed ones, most reviewed first', async () => {
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    assert.deepEqual(body.includedTypes, ['lodging']);
    assert.equal(body.locationRestriction.circle.radius, 3000);
    return new Response(JSON.stringify({ places: [
      { id: 'me', displayName: { text: 'Me' }, userRatingCount: 999 },
      { id: 'x', displayName: { text: 'X' }, userRatingCount: 10 },
      { id: 'y', displayName: { text: 'Y' }, userRatingCount: 50, businessStatus: 'CLOSED_PERMANENTLY' },
      { id: 'z', displayName: { text: 'Z' }, userRatingCount: 70, rating: 4.4 },
    ] }), { status: 200 });
  };
  const out = await findCompetitors(basePlace, 'KEY', fetchImpl);
  assert.deepEqual(out.map((c) => c.placeId), ['z', 'x']);
});

test('findCompetitors needs a location and a type', async () => {
  assert.deepEqual(await findCompetitors({ ...basePlace, type: null }, 'KEY', async () => { throw new Error('should not call'); }), []);
});
