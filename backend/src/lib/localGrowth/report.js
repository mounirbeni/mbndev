// MBN Local Growth: a business's online presence vs. its nearest competitors.
// Google data comes through the buyer's own Places (New) key; the website
// audit and scoring are shared with MBN Leads AI.
const { PlacesError } = require('../leadsAi/places');
const { scoreAudit } = require('../leadsAi/score');

const DETAIL_FIELDS = [
  'id', 'displayName', 'formattedAddress', 'location', 'types', 'primaryType', 'primaryTypeDisplayName',
  'rating', 'userRatingCount', 'websiteUri', 'internationalPhoneNumber', 'nationalPhoneNumber',
  'regularOpeningHours', 'photos', 'reviews', 'googleMapsUri', 'businessStatus',
].join(',');
const NEARBY_FIELDS = 'places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.businessStatus';
const DAY = 24 * 60 * 60 * 1000;

async function googleJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PlacesError(data?.error?.message || `Google Places error ${res.status}`, res.status === 400 || res.status === 403 ? 400 : 502);
  }
  return data;
}

/** Full Google profile of one business. */
async function fetchPlace(placeId, apiKey, fetchImpl = fetch) {
  const res = await fetchImpl(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': DETAIL_FIELDS },
    signal: AbortSignal.timeout(15000),
  });
  const p = await googleJson(res);
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];
  const reviewDates = reviews.map((r) => Date.parse(r.publishTime)).filter(Number.isFinite);
  return {
    placeId:      p.id,
    name:         p.displayName?.text || 'Unknown',
    address:      p.formattedAddress || null,
    location:     p.location || null,
    type:         p.primaryType || (Array.isArray(p.types) ? p.types[0] : null) || null,
    typeLabel:    p.primaryTypeDisplayName?.text || null,
    rating:       typeof p.rating === 'number' ? p.rating : null,
    reviews:      typeof p.userRatingCount === 'number' ? p.userRatingCount : 0,
    website:      p.websiteUri || null,
    phone:        p.internationalPhoneNumber || p.nationalPhoneNumber || null,
    hasHours:     Boolean(p.regularOpeningHours),
    photos:       Array.isArray(p.photos) ? p.photos.length : 0,
    lastReviewAt: reviewDates.length ? new Date(Math.max(...reviewDates)).toISOString() : null,
    recentRatings: reviews.map((r) => r.rating).filter((n) => typeof n === 'number'),
    mapsUrl:      p.googleMapsUri || null,
  };
}

/** Up to 5 nearby businesses of the same type, most reviewed first. */
async function findCompetitors(place, apiKey, fetchImpl = fetch) {
  if (!place.location || !place.type) return [];
  const res = await fetchImpl('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': NEARBY_FIELDS },
    body: JSON.stringify({
      includedTypes: [place.type],
      maxResultCount: 15,
      rankPreference: 'POPULARITY',
      locationRestriction: { circle: { center: place.location, radius: 3000 } },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await googleJson(res);
  return (data.places || [])
    .filter((c) => c.id !== place.placeId && c.businessStatus !== 'CLOSED_PERMANENTLY')
    .map((c) => ({
      placeId: c.id,
      name:    c.displayName?.text || 'Unknown',
      rating:  typeof c.rating === 'number' ? c.rating : null,
      reviews: typeof c.userRatingCount === 'number' ? c.userRatingCount : 0,
      website: c.websiteUri || null,
      mapsUrl: c.googleMapsUri || null,
    }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

/** Turns the raw data into scores, a benchmark and a prioritised action plan. Pure. */
function buildReport({ place, competitors = [], audit, now = new Date() }) {
  const compReviews = competitors.map((c) => c.reviews);
  const compRatings = competitors.map((c) => c.rating).filter((r) => r != null);
  const benchmark = {
    competitors:   competitors.length,
    medianReviews: median(compReviews),
    avgRating:     round1(avg(compRatings)),
    withWebsite:   competitors.filter((c) => c.website).length,
  };

  // Reputation: rating + review volume (relative to competitors when we have them).
  const r = place.rating;
  const ratingPts = r == null ? 0 : r >= 4.7 ? 50 : r >= 4.5 ? 42 : r >= 4.2 ? 32 : r >= 4.0 ? 24 : r >= 3.5 ? 14 : 5;
  let volumePts;
  if (benchmark.medianReviews) {
    const ratio = place.reviews / Math.max(1, benchmark.medianReviews);
    volumePts = ratio >= 1.5 ? 50 : ratio >= 1 ? 40 : ratio >= 0.6 ? 28 : ratio >= 0.3 ? 16 : 6;
  } else {
    const n = place.reviews;
    volumePts = n >= 200 ? 50 : n >= 100 ? 40 : n >= 40 ? 28 : n >= 10 ? 16 : 6;
  }
  const reputation = ratingPts + volumePts;

  // Website: inverse of the Leads AI opportunity score.
  const auditScore = scoreAudit(audit);
  const website = audit?.hasWebsite ? Math.max(5, 100 - auditScore.score) : 5;

  // Google profile completeness.
  const daysSinceReview = place.lastReviewAt ? Math.floor((now - new Date(place.lastReviewAt)) / DAY) : null;
  const profile = (place.website ? 25 : 0) + (place.phone ? 20 : 0) + (place.hasHours ? 20 : 0)
    + (place.photos >= 5 ? 20 : place.photos > 0 ? 10 : 0)
    + (daysSinceReview != null && daysSinceReview <= 90 ? 15 : 0);

  const scores = {
    overall: Math.round(0.4 * reputation + 0.35 * website + 0.25 * profile),
    reputation,
    website,
    profile,
  };

  const actions = [];
  const add = (priority, area, title, detail) => actions.push({ priority, area, title, detail });

  if (!place.website) {
    add('high', 'website', 'Get a website that converts', `${benchmark.withWebsite} of ${benchmark.competitors} nearby competitors have one. A fast, mobile-first site with a clear call-to-action turns Google Maps visitors into customers.`);
  } else if (audit && !audit.reachable) {
    add('high', 'website', 'Fix your website — it is down or unreachable', 'Visitors from Google currently hit an error page. Every day it stays down costs bookings and trust.');
  } else {
    for (const issue of auditScore.issues) {
      const map = {
        not_mobile: ['high', 'Make the website mobile-friendly', 'Most local searches happen on phones; the site does not adapt to small screens.'],
        no_https:   ['high', 'Secure the website with HTTPS', 'Browsers label the site “Not secure”, which scares visitors away.'],
        slow:       ['high', 'Speed up the website', `${issue.label}. Slow pages lose visitors before they see your offer.`],
        slowish:    ['medium', 'Make the website faster', `${issue.label}. Every second matters on mobile.`],
        outdated:   ['medium', 'Refresh the website design', `${issue.label}. An outdated look lowers trust.`],
        ota_only:   ['high', 'Take direct bookings', 'Bookings go through third-party platforms that take a commission on every reservation. A direct booking button keeps that margin.'],
        no_booking: ['medium', 'Add a clear booking / contact button', 'Visitors should be able to book, call or message you in one tap.'],
        no_meta:    ['low', 'Add an SEO description', 'Google shows a random snippet instead of your pitch.'],
        no_title:   ['low', 'Add a page title', 'The browser tab and Google results show no proper name.'],
        no_contact: ['medium', 'Show a contact form or email', 'Visitors who are ready to buy can’t easily reach you.'],
      }[issue.key];
      if (map) add(map[0], 'website', map[1], map[2]);
    }
  }

  if (benchmark.medianReviews && place.reviews < benchmark.medianReviews) {
    const gap = Math.ceil(benchmark.medianReviews - place.reviews);
    add('high', 'reputation', 'Collect more Google reviews', `You have ${place.reviews} reviews; nearby competitors have about ${Math.round(benchmark.medianReviews)}. Aim for +${gap} in the next 90 days — ask happy customers with a QR code and a follow-up message.`);
  } else if (!benchmark.medianReviews && place.reviews < 40) {
    add('high', 'reputation', 'Collect more Google reviews', `Only ${place.reviews} reviews. Businesses with 40+ recent reviews win far more clicks on Google Maps.`);
  }
  if (place.rating != null && benchmark.avgRating != null && place.rating < benchmark.avgRating - 0.2) {
    add('medium', 'reputation', 'Lift your rating', `Your rating is ${place.rating} vs ${benchmark.avgRating} for competitors. Reply to every review — especially negative ones — and fix the issues they mention.`);
  }
  if (daysSinceReview == null || daysSinceReview > 90) {
    add('medium', 'reputation', 'Get fresh reviews', daysSinceReview == null
      ? 'No recent reviews are visible. Google favours businesses with steady, recent feedback.'
      : `Your latest review is ${Math.round(daysSinceReview / 30)} months old. Google favours businesses with steady, recent feedback.`);
  }
  if (!place.hasHours) add('medium', 'profile', 'Add opening hours to Google', 'Without hours, Google may hide you from “open now” searches.');
  if (!place.phone) add('medium', 'profile', 'Add a phone number to Google', 'Many customers call straight from Google Maps.');
  if (place.photos < 5) add('low', 'profile', 'Add more photos to Google', `Only ${place.photos} photo${place.photos === 1 ? '' : 's'} visible. Profiles with recent, real photos get more clicks.`);
  if (audit?.reachable && !Object.keys(audit.social || {}).length) add('low', 'profile', 'Link your social profiles', 'No Instagram or Facebook link on the website — an easy trust signal to add.');

  const order = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => order[a.priority] - order[b.priority]);

  return {
    business: {
      name: place.name, address: place.address, type: place.typeLabel, rating: place.rating,
      reviews: place.reviews, website: place.website, phone: place.phone, hasHours: place.hasHours,
      photos: place.photos, lastReviewAt: place.lastReviewAt, mapsUrl: place.mapsUrl,
    },
    scores,
    benchmark,
    competitors,
    websiteAudit: audit || { hasWebsite: false },
    websiteIssues: auditScore.issues,
    actions,
    generatedAt: now.toISOString(),
  };
}

module.exports = { fetchPlace, findCompetitors, buildReport };
