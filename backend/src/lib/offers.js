// ─── Personal offers ────────────────────────────────────────────────────────
// Each visitor can be handed a random discount (OFFER_MIN_PCT..OFFER_MAX_PCT,
// default 5–15%) that stays valid for OFFER_TTL_HOURS (default 72h).
//
// The offer is a signed token, so the client can't choose or inflate its own
// percentage: createOrder verifies the signature and expiry and applies the
// discount server-side. Base prices (lib/pricing.js) are never changed.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function intEnv(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) ? n : fallback;
}

function config() {
  const min = Math.min(Math.max(intEnv('OFFER_MIN_PCT', 5), 0), 50);
  const max = Math.min(Math.max(intEnv('OFFER_MAX_PCT', 15), min), 50);
  const ttlHours = Math.max(intEnv('OFFER_TTL_HOURS', 72), 1);
  return { min, max, ttlHours, enabled: max > 0 };
}

function secret() {
  return process.env.OFFER_SECRET || process.env.JWT_SECRET;
}

/** Issue a new random offer. Returns null when offers are disabled. */
function issueOffer() {
  const { min, max, ttlHours, enabled } = config();
  if (!enabled || !secret()) return null;
  const pct = crypto.randomInt(min, max + 1);
  const token = jwt.sign({ typ: 'offer', pct }, secret(), { expiresIn: `${ttlHours}h` });
  const { exp } = jwt.decode(token);
  return { token, pct, expiresAt: new Date(exp * 1000).toISOString() };
}

/** Discount percentage carried by a valid, unexpired offer token, else 0. */
function verifyOffer(token) {
  if (!token || typeof token !== 'string' || !secret()) return 0;
  try {
    const payload = jwt.verify(token, secret());
    if (payload.typ !== 'offer') return 0;
    const pct = Number(payload.pct);
    // Never honour more than the configured ceiling, even for older tokens.
    return Number.isInteger(pct) && pct > 0 ? Math.min(pct, config().max) : 0;
  } catch {
    return 0;
  }
}

function applyDiscount(total, pct) {
  if (!pct) return total;
  return Math.round(total * (1 - pct / 100));
}

module.exports = { issueOffer, verifyOffer, applyDiscount, config };
