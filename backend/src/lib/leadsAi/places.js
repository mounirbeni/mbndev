// Business search through the buyer's own Google Places API (New) key.
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress',
  'places.internationalPhoneNumber', 'places.nationalPhoneNumber',
  'places.websiteUri', 'places.rating', 'places.userRatingCount',
  'places.googleMapsUri', 'places.businessStatus', 'nextPageToken',
].join(',');

class PlacesError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

function normalize(p) {
  return {
    placeId: p.id,
    name:    p.displayName?.text || 'Unknown',
    address: p.formattedAddress || null,
    phone:   p.internationalPhoneNumber || p.nationalPhoneNumber || null,
    website: p.websiteUri || null,
    rating:  typeof p.rating === 'number' ? p.rating : null,
    reviews: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    mapsUrl: p.googleMapsUri || null,
    closed:  p.businessStatus === 'CLOSED_PERMANENTLY',
  };
}

/** Up to `max` (≤60, Google's cap) businesses for a free-text query. */
async function searchPlaces({ query, apiKey, max = 60, fetchImpl = fetch }) {
  const out = [];
  let pageToken;
  do {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
      body: JSON.stringify({ textQuery: query, pageSize: 20, ...(pageToken ? { pageToken } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || `Google Places error ${res.status}`;
      throw new PlacesError(msg, res.status === 400 || res.status === 403 ? 400 : 502);
    }
    for (const p of data.places || []) {
      const n = normalize(p);
      if (!n.closed) out.push(n);
    }
    pageToken = data.nextPageToken;
  } while (pageToken && out.length < max);
  return out.slice(0, max);
}

module.exports = { searchPlaces, PlacesError, normalize };
