// MBN Review Booster monitoring: reads a business's Google rating, review
// count and latest reviews through the owner's Places API (New) key.
// Google returns at most 5 reviews per request, so new reviews are detected
// both from the review list and from the change in the total count.
const { PlacesError } = require('../leadsAi/places');

const FIELDS = 'id,displayName,rating,userRatingCount,reviews';

function placeIdFromUrl(url) {
  try {
    const id = new URL(url).searchParams.get('placeid');
    return id && /^[A-Za-z0-9_-]{10,300}$/.test(id) ? id : null;
  } catch { return null; }
}

/** { rating, count, reviews: [{ googleId, author, rating, text, language, publishedAt }] } */
async function fetchGoogleReviews(placeId, apiKey, fetchImpl = fetch) {
  const res = await fetchImpl(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELDS },
    signal: AbortSignal.timeout(15000),
  });
  const p = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PlacesError(p?.error?.message || `Google Places error ${res.status}`, res.status === 400 || res.status === 403 || res.status === 404 ? 400 : 502);
  }
  const reviews = (Array.isArray(p.reviews) ? p.reviews : [])
    .filter((r) => r && typeof r.rating === 'number' && r.name)
    .map((r) => ({
      googleId:    String(r.name).slice(0, 300),
      author:      r.authorAttribution?.displayName?.slice(0, 120) || null,
      rating:      Math.max(1, Math.min(5, Math.round(r.rating))),
      text:        (r.originalText?.text || r.text?.text || '').slice(0, 4000) || null,
      language:    (r.originalText?.languageCode || r.text?.languageCode || '').slice(0, 10) || null,
      publishedAt: Number.isFinite(Date.parse(r.publishTime)) ? new Date(r.publishTime) : null,
    }));
  return {
    rating: typeof p.rating === 'number' ? p.rating : null,
    count:  typeof p.userRatingCount === 'number' ? p.userRatingCount : 0,
    reviews,
  };
}

/**
 * Check one business, store what's new and return it.
 * First check is a baseline: nothing counts as "new".
 */
async function checkBusiness(prisma, business, apiKey, fetchImpl = fetch) {
  const data = await fetchGoogleReviews(business.placeId, apiKey, fetchImpl);
  const baseline = business.monitoredAt == null;

  const known = new Set((await prisma.googleReview.findMany({
    where: { businessId: business.id, googleId: { in: data.reviews.map((r) => r.googleId) } },
    select: { googleId: true },
  })).map((r) => r.googleId));
  const fresh = data.reviews.filter((r) => !known.has(r.googleId));

  if (fresh.length) {
    await prisma.googleReview.createMany({ data: fresh.map((r) => ({ ...r, businessId: business.id })), skipDuplicates: true });
  }
  await prisma.reviewSnapshot.create({ data: { businessId: business.id, rating: data.rating, ratingCount: data.count } });
  await prisma.reviewBusiness.update({
    where: { id: business.id },
    data: { rating: data.rating, ratingCount: data.count, monitoredAt: new Date(), monitorError: null },
  });

  const countDelta = baseline || business.ratingCount == null ? 0 : Math.max(0, data.count - business.ratingCount);
  return {
    rating: data.rating,
    count: data.count,
    newCount: baseline ? 0 : Math.max(countDelta, fresh.length),
    newReviews: baseline ? [] : fresh,
    ratingBefore: business.rating,
  };
}

module.exports = { fetchGoogleReviews, checkBusiness, placeIdFromUrl };
