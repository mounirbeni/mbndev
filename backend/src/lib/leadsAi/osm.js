// Free business search from OpenStreetMap — used whenever the buyer has no
// Google Places key. "dentists in London" → geocode "London" (Nominatim) →
// Overpass query for amenity=dentist in that box → the same shape as
// places.js normalize(), so the rest of Leads AI doesn't care where results
// came from. Coverage is thinner than Google (no ratings/reviews) but costs
// nothing. Public endpoints: keep usage modest (Nominatim ≈1 req/s policy).

const UA = 'MBN-DEV-LeadsAI/1.0 (+https://mbndev.ma; contact@mbndev.ma)';
const OVERPASS_URL = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

class OsmError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

// keyword (singular, lowercase, accents stripped) → OSM tags [, name filter]
const KEYWORDS = [
  [['dentist', 'dentiste', 'dental clinic', 'cabinet dentaire'], [['amenity', 'dentist']]],
  [['doctor', 'medecin', 'clinic', 'clinique', 'medical center', 'centre medical'], [['amenity', 'clinic'], ['amenity', 'doctors']]],
  [['pharmacy', 'pharmacie'], [['amenity', 'pharmacy']]],
  [['vet', 'veterinary', 'veterinaire'], [['amenity', 'veterinary']]],
  [['restaurant'], [['amenity', 'restaurant']]],
  [['cafe', 'coffee shop', 'coffee'], [['amenity', 'cafe']]],
  [['bar', 'pub'], [['amenity', 'bar'], ['amenity', 'pub']]],
  [['bakery', 'boulangerie', 'patisserie', 'pastry shop'], [['shop', 'bakery'], ['shop', 'pastry']]],
  [['riad'], [['tourism', 'guest_house'], ['tourism', 'hotel']], 'riad'],
  [['hotel', 'hostel', 'guest house', 'guesthouse', 'maison d hote', 'b&b', 'bed and breakfast'], [['tourism', 'hotel'], ['tourism', 'guest_house'], ['tourism', 'hostel']]],
  [['gym', 'fitness', 'fitness center', 'salle de sport', 'crossfit'], [['leisure', 'fitness_centre']]],
  [['hairdresser', 'hair salon', 'salon', 'coiffeur', 'barber', 'barbershop'], [['shop', 'hairdresser']]],
  [['spa', 'hammam', 'beauty salon', 'institut de beaute', 'nail salon'], [['shop', 'beauty'], ['leisure', 'spa'], ['amenity', 'public_bath']]],
  [['lawyer', 'avocat', 'law firm', 'attorney'], [['office', 'lawyer']]],
  [['accountant', 'comptable', 'accounting firm'], [['office', 'accountant']]],
  [['real estate', 'real estate agency', 'estate agent', 'realtor', 'agence immobiliere', 'immobilier'], [['office', 'estate_agent']]],
  [['architect', 'architecte'], [['office', 'architect']]],
  [['travel agency', 'agence de voyage', 'tour operator'], [['shop', 'travel_agency'], ['office', 'travel_agent']]],
  [['car repair', 'garage', 'mechanic', 'auto repair'], [['shop', 'car_repair']]],
  [['car dealer', 'car dealership', 'concessionnaire'], [['shop', 'car']]],
  [['driving school', 'auto ecole'], [['amenity', 'driving_school']]],
  [['school', 'ecole'], [['amenity', 'school']]],
  [['florist', 'fleuriste', 'flower shop'], [['shop', 'florist']]],
  [['optician', 'opticien'], [['shop', 'optician']]],
  [['clothing store', 'clothes shop', 'boutique', 'fashion store'], [['shop', 'clothes'], ['shop', 'boutique']]],
  [['jewelry', 'jewellery', 'bijouterie'], [['shop', 'jewelry']]],
  [['furniture', 'meubles', 'furniture store'], [['shop', 'furniture']]],
  [['plumber', 'plombier'], [['craft', 'plumber']]],
  [['electrician', 'electricien'], [['craft', 'electrician']]],
  [['photographer', 'photographe'], [['craft', 'photographer'], ['shop', 'photo']]],
];

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim();
const singular = (w) => w.replace(/(ies)$/, 'y').replace(/(ches|shes|sses|xes)$/, (m) => m.slice(0, -2)).replace(/([^s])s$/, '$1');

/** "dentists in London" → { what: 'dentists', where: 'London' } (EN/FR/AR "in"). */
function parseQuery(text) {
  const t = String(text || '').trim();
  const m = t.match(/^(.+?)\s+(?:in|near|around|à|en|au|aux|dans|في)\s+(.+)$/i);
  if (!m) return null;
  return { what: m[1].trim(), where: m[2].trim() };
}

/** Category words → OSM tags, or a name filter when nothing matches. */
function tagsFor(what) {
  const f = fold(what);
  const phrase = f.split(' ').map(singular).join(' ');
  const has = (w) => ` ${phrase} `.includes(` ${w} `) || ` ${f} `.includes(` ${w} `);   // whole words only
  for (const [words, tags, nameFilter] of KEYWORDS) {
    if (words.some(has)) return { tags, nameFilter: nameFilter || null };
  }
  return { tags: null, nameFilter: phrase.slice(0, 40) };
}

const esc = (s) => s.replace(/[\\"]/g, '').replace(/[.*+?^${}()|[\]]/g, '\\$&');

function buildQuery({ tags, nameFilter }, bbox, max) {
  const box = `(${bbox.s},${bbox.w},${bbox.n},${bbox.e})`;
  const name = nameFilter ? `["name"~"${esc(nameFilter)}",i]` : '["name"]';
  const parts = tags
    ? tags.map(([k, v]) => `nwr["${k}"="${v}"]${name}${box};`)
    : [`nwr["shop"]${name}${box};`, `nwr["amenity"]${name}${box};`, `nwr["office"]${name}${box};`, `nwr["tourism"]${name}${box};`, `nwr["craft"]${name}${box};`, `nwr["leisure"]${name}${box};`];
  return `[out:json][timeout:25];(${parts.join('')});out center tags ${Math.max(max * 3, 60)};`;
}

const site = (raw) => {
  if (!raw) return null;
  let s = String(raw).trim().split(/[\s;]+/)[0];
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try { const u = new URL(s); return u.hostname.includes('.') ? u.toString() : null; } catch { return null; }
};

/** OSM element → the shape of places.js normalize(). */
function normalizeOsm(el) {
  const t = el.tags || {};
  const street = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
  const address = [street, t['addr:postcode'], t['addr:city']].filter(Boolean).join(', ') || null;
  const phone = (t.phone || t['contact:phone'] || t['contact:mobile'] || '').split(';')[0].trim() || null;
  const email = (t.email || t['contact:email'] || '').split(/[;,\s]/)[0].trim().toLowerCase();
  return {
    placeId: `osm:${el.type}/${el.id}`,
    name:    t.name,
    address,
    phone,
    website: site(t.website || t['contact:website'] || t.url),
    email:   /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) ? email : null,   // listed on the map (Google never returns emails)
    rating:  null,
    reviews: null,
    mapsUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    closed:  false,
  };
}

function parseResults(json, max) {
  const seen = new Set();
  const out = [];
  for (const el of json?.elements || []) {
    const name = el.tags?.name?.trim();
    if (!name || el.tags.disused || el.tags['disused:shop']) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalizeOsm(el));
  }
  // Contactable businesses first, then by name.
  out.sort((a, b) => (Number(!!b.phone) + Number(!!b.website)) - (Number(!!a.phone) + Number(!!a.website)) || a.name.localeCompare(b.name));
  return out.slice(0, max);
}

async function geocode(where, fetchImpl) {
  const r = await fetchImpl(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(where)}`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new OsmError(`Place lookup failed (${r.status})`, 502);
  const [hit] = await r.json();
  const bb = hit?.boundingbox?.map(Number);
  if (!bb || bb.length !== 4 || bb.some((v) => !Number.isFinite(v))) throw new OsmError(`Couldn't find "${where}". Try a city name.`, 400);
  return { s: bb[0], n: bb[1], w: bb[2], e: bb[3] };
}

/** Up to `max` businesses for a "<what> in <where>" query. */
async function searchOsm({ query, max = 60, fetchImpl = fetch }) {
  const parsed = parseQuery(query);
  if (!parsed) throw new OsmError('Use the form "<businesses> in <city>", e.g. "dentists in London".', 400);
  const bbox = await geocode(parsed.where, fetchImpl);
  const r = await fetchImpl(OVERPASS_URL, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(buildQuery(tagsFor(parsed.what), bbox, max))}`,
    signal: AbortSignal.timeout(35000),
  });
  if (!r.ok) throw new OsmError(r.status === 429 || r.status === 504 ? 'The free map search is busy — try again in a minute.' : `Map search failed (${r.status})`, 502);
  return parseResults(await r.json(), max);
}

module.exports = { searchOsm, OsmError, parseQuery, tagsFor, buildQuery, parseResults, normalizeOsm };
