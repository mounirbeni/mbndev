const { test } = require('node:test');
const assert = require('node:assert');
const { parseQuery, tagsFor, buildQuery, parseResults, searchOsm } = require('../src/lib/leadsAi/osm');

test('parseQuery splits "<what> in <where>" in EN/FR/AR', () => {
  assert.deepEqual(parseQuery('dentists in London'), { what: 'dentists', where: 'London' });
  assert.deepEqual(parseQuery('riads à Marrakech'), { what: 'riads', where: 'Marrakech' });
  assert.deepEqual(parseQuery('cafés à Aix en Provence'), { what: 'cafés', where: 'Aix en Provence' });
  assert.deepEqual(parseQuery('مطاعم في الرباط'), { what: 'مطاعم', where: 'الرباط' });
  assert.equal(parseQuery('dentists'), null);
});

test('tagsFor maps plurals, French and multi-word categories', () => {
  assert.deepEqual(tagsFor('dentists').tags, [['amenity', 'dentist']]);
  assert.deepEqual(tagsFor('Hair salons').tags, [['shop', 'hairdresser']]);
  assert.deepEqual(tagsFor('salles de sport').tags, [['leisure', 'fitness_centre']]);
  assert.deepEqual(tagsFor('barbers').tags, [['shop', 'hairdresser']]);          // not "bar"
  assert.deepEqual(tagsFor('agences immobilières').tags, [['office', 'estate_agent']]);
  assert.equal(tagsFor('riads').nameFilter, 'riad');
  const unknown = tagsFor('wedding planners');
  assert.equal(unknown.tags, null);
  assert.equal(unknown.nameFilter, 'wedding planner');
});

test('buildQuery escapes the name filter and uses the box', () => {
  const q = buildQuery({ tags: null, nameFilter: 'a"b.(c)' }, { s: 1, w: 2, n: 3, e: 4 }, 20);
  assert.ok(!q.includes('a"b'));
  assert.match(q, /\["name"~"ab\\\.\\\(c\\\)",i\]\(1,2,3,4\)/);
  assert.match(q, /out center tags 60;/);
});

test('parseResults returns the Places shape, dedupes, contactable first', () => {
  const r = parseResults({ elements: [
    { type: 'node', id: 1, tags: { name: 'Quiet Clinic' } },
    { type: 'way', id: 2, tags: { name: 'Smile Dental', website: 'smile.co.uk', 'contact:email': 'Hello@Smile.co.uk', phone: '+44 20 1234; +44 20 9999', 'addr:street': 'High St', 'addr:housenumber': '5', 'addr:city': 'London' } },
    { type: 'node', id: 3, tags: { name: 'smile dental' } },
    { type: 'node', id: 4, tags: { name: 'Closed Co', disused: 'yes' } },
  ] }, 10);
  assert.equal(r.length, 2);
  assert.deepEqual(r[0], {
    placeId: 'osm:way/2', name: 'Smile Dental', address: '5 High St, London', phone: '+44 20 1234',
    website: 'https://smile.co.uk/', email: 'hello@smile.co.uk', rating: null, reviews: null, mapsUrl: 'https://www.openstreetmap.org/way/2', closed: false,
  });
});

test('searchOsm geocodes then queries Overpass', async () => {
  const calls = [];
  const fetchImpl = async (url, opts = {}) => {
    calls.push(String(url));
    if (String(url).includes('nominatim')) return { ok: true, json: async () => [{ boundingbox: ['51.2', '51.7', '-0.5', '0.3'] }] };
    assert.match(decodeURIComponent(opts.body), /amenity"="dentist"/);
    return { ok: true, json: async () => ({ elements: [{ type: 'node', id: 9, tags: { name: 'Dent A' } }] }) };
  };
  const r = await searchOsm({ query: 'dentists in London', max: 5, fetchImpl });
  assert.equal(calls.length, 2);
  assert.equal(r[0].placeId, 'osm:node/9');
  await assert.rejects(searchOsm({ query: 'dentists', fetchImpl }), /Use the form/);
});
