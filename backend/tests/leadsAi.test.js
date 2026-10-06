const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret';
const { analyzeHtml, isPrivateIp, assertPublicUrl, safeFetch, auditWebsite } = require('../src/lib/leadsAi/audit');
const { scoreAudit } = require('../src/lib/leadsAi/score');
const { encrypt, decrypt } = require('../src/lib/leadsAi/crypto');
const { templateMessage, generateMessage } = require('../src/lib/leadsAi/message');
const { searchPlaces } = require('../src/lib/leadsAi/places');

const NOW = new Date('2026-10-06');
const publicLookup = async () => [{ address: '93.184.216.34' }];

test('analyzeHtml reads the signals of an old site', () => {
  const html = `<html><head><title>Riad Test</title><script src="/js/jquery-1.8.3.min.js"></script></head>
    <body><font>Welcome</font><a href="https://www.booking.com/hotel/ma/x.html">Book</a>
    <a href="mailto:Info@RiadTest.com">mail</a><p>© 2016 Riad Test</p></body></html>`;
  const a = analyzeHtml(html, { finalUrl: 'http://riadtest.com/', now: NOW });
  assert.equal(a.https, false);
  assert.equal(a.mobileFriendly, false);
  assert.equal(a.title, 'Riad Test');
  assert.equal(a.copyrightYear, 2016);
  assert.ok(a.outdatedSignals.some((s) => s.includes('jQuery 1.8.3')));
  assert.ok(a.outdatedSignals.includes('<font> tags'));
  assert.ok(a.outdatedSignals.includes('Copyright 2016'));
  assert.equal(a.hasBooking, false);
  assert.equal(a.thirdPartyBookingOnly, true);
  assert.deepEqual(a.emails, ['info@riadtest.com']);
});

test('analyzeHtml recognises a modern site with direct booking', () => {
  const html = `<html><head><meta name="viewport" content="width=device-width"><meta name="description" content="Boutique riad in the medina">
    <title>Riad</title></head><body><main><h1>Riad</h1><a href="https://hotels.cloudbeds.com/reservation/abc">Book now</a>
    <form></form><a href="https://instagram.com/riad">ig</a></main><footer>© 2025</footer></body></html>`;
  const a = analyzeHtml(html, { finalUrl: 'https://riad.ma/', now: NOW });
  assert.equal(a.https, true);
  assert.equal(a.mobileFriendly, true);
  assert.equal(a.hasBooking, true);
  assert.deepEqual(a.bookingProviders, ['cloudbeds']);
  assert.deepEqual(a.outdatedSignals, []);
  assert.equal(a.social.instagram, 'https://instagram.com/riad');
});

test('scoreAudit ranks missing and weak websites', () => {
  assert.equal(scoreAudit({ hasWebsite: false }).score, 95);
  assert.equal(scoreAudit({ hasWebsite: true, reachable: false }).level, 'hot');
  const weak = scoreAudit({ hasWebsite: true, reachable: true, https: false, mobileFriendly: false, responseMs: 4200, outdatedSignals: ['Copyright 2016'], hasBooking: false, thirdPartyBookingOnly: true, hasMetaDescription: false, title: 'x', hasContactForm: true, emails: [] });
  assert.equal(weak.score, 82);
  assert.equal(weak.issues[0].key, 'not_mobile');
  const good = scoreAudit({ hasWebsite: true, reachable: true, https: true, mobileFriendly: true, responseMs: 600, outdatedSignals: [], hasBooking: true, hasMetaDescription: true, title: 'x', hasContactForm: true, emails: ['a@b.co'] });
  assert.equal(good.score, 0);
  assert.equal(good.level, 'low');
});

test('private and local addresses are refused', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.1.1', '172.20.0.1', '169.254.169.254', '::1', 'fd00::1', '::ffff:10.0.0.1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  assert.equal(isPrivateIp('93.184.216.34'), false);
  await assert.rejects(assertPublicUrl('http://169.254.169.254/latest/meta-data'));
  await assert.rejects(assertPublicUrl('http://example.com:8080/', publicLookup));
  await assert.rejects(assertPublicUrl('file:///etc/passwd'));
  await assert.rejects(assertPublicUrl('http://internal.test/', async () => [{ address: '10.0.0.5' }]));
  await assertPublicUrl('https://example.com/', publicLookup);
});

test('a redirect to a private address is not followed', async () => {
  const fetchImpl = async () => new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } });
  await assert.rejects(safeFetch('https://example.com/', { fetchImpl, lookup: publicLookup }), /not public/);
});

test('auditWebsite never throws and reports unreachable sites', async () => {
  const fetchImpl = async () => { throw new Error('ECONNREFUSED'); };
  const a = await auditWebsite('example.com', { fetchImpl, lookup: publicLookup });
  assert.equal(a.reachable, false);
  assert.deepEqual(await auditWebsite(null), { hasWebsite: false });
});

test('API keys round-trip through encryption and tampering fails', () => {
  const packed = encrypt('sk-test-1234567890abcdefghij');
  assert.notEqual(packed, 'sk-test-1234567890abcdefghij');
  assert.equal(decrypt(packed), 'sk-test-1234567890abcdefghij');
  assert.equal(decrypt(packed.slice(0, -4) + 'AAAA'), null);
  assert.equal(decrypt(null), null);
});

test('template message lists real findings and the opt-out', () => {
  const msg = templateMessage({ business: { name: 'Riad Test', website: 'https://riadtest.com/' }, issues: [{ key: 'not_mobile', label: 'Not mobile-friendly' }], senderName: 'Mounir' });
  assert.match(msg, /riadtest\.com/);
  assert.match(msg, /Not mobile-friendly/);
  assert.match(msg, /Mounir/);
  assert.match(msg, /won't contact you again/);
  const fr = templateMessage({ business: { name: 'Riad', website: null }, issues: [{ key: 'no_website', label: 'No website' }], lang: 'fr' });
  assert.match(fr, /pas trouvé de site/);
});

test('AI failure falls back to the template', async () => {
  const out = await generateMessage({ apiKey: 'sk-x', business: { name: 'A' }, issues: [], fetchImpl: async () => new Response('{"error":{"message":"bad key"}}', { status: 401 }) });
  assert.equal(out.source, 'template');
  assert.match(out.warning, /bad key/);
});

test('searchPlaces pages through results and drops closed businesses', async () => {
  let calls = 0;
  const fetchImpl = async (_url, init) => {
    calls += 1;
    const body = JSON.parse(init.body);
    assert.equal(init.headers['X-Goog-Api-Key'], 'KEY');
    const page = body.pageToken ? 2 : 1;
    return new Response(JSON.stringify({
      places: [
        { id: `p${page}a`, displayName: { text: `Biz ${page}A` }, websiteUri: 'https://a.example', rating: 4.5, userRatingCount: 10 },
        { id: `p${page}b`, displayName: { text: `Biz ${page}B` }, businessStatus: 'CLOSED_PERMANENTLY' },
      ],
      ...(page === 1 ? { nextPageToken: 'next' } : {}),
    }), { status: 200 });
  };
  const out = await searchPlaces({ query: 'riads in Marrakech', apiKey: 'KEY', fetchImpl });
  assert.equal(calls, 2);
  assert.deepEqual(out.map((p) => p.placeId), ['p1a', 'p2a']);
  assert.equal(out[0].reviews, 10);
});
