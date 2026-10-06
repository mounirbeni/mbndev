// Turns what an owner pastes (a Google Place ID or a Google review / Maps
// link) into the link customers open to leave a Google review.

const GOOGLE_HOST = /(^|\.)google\.(?:(?:com|co)(?:\.[a-z]{2})?|[a-z]{2,3})$|^g\.page$|^maps\.app\.goo\.gl$|^goo\.gl$/i;

function normalizeReviewUrl(input) {
  const v = String(input || '').trim();
  if (/^ChIJ[\w-]{10,}$/.test(v)) {
    return `https://search.google.com/local/writereview?placeid=${v}`;
  }
  let url;
  try { url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!GOOGLE_HOST.test(url.hostname)) return null;
  url.protocol = 'https:';
  const out = url.toString();
  return out.length <= 600 ? out : null;
}

module.exports = { normalizeReviewUrl };
