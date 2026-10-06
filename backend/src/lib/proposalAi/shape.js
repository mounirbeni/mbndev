// Proposal content and price items: clean whatever comes from the AI or the
// editor into a safe, bounded shape, and compute totals.
const crypto = require('crypto');

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const CURRENCIES = ['USD', 'EUR', 'GBP', 'MAD', 'CAD', 'AUD', 'AED', 'SAR'];
const LANGUAGES = ['en', 'fr', 'ar', 'es'];

function normalizeContent(c) {
  const src = c && typeof c === 'object' ? c : {};
  const phases = (Array.isArray(src.phases) ? src.phases : []).slice(0, 10)
    .map((p) => ({ title: str(p?.title, 120), description: str(p?.description, 1500), duration: str(p?.duration, 60) }))
    .filter((p) => p.title || p.description);
  return {
    intro:    str(src.intro, 3000),
    solution: str(src.solution, 5000),
    phases,
    terms:    str(src.terms, 3000),
  };
}

function normalizeItems(items) {
  return (Array.isArray(items) ? items : []).slice(0, 25).map((it) => {
    const price = Math.round(Math.max(0, Math.min(10_000_000, Number(it?.price) || 0)) * 100) / 100;
    return {
      id: /^[a-z0-9]{6,24}$/i.test(String(it?.id || '')) ? String(it.id) : crypto.randomBytes(6).toString('hex'),
      name: str(it?.name, 140),
      description: str(it?.description, 600),
      price,
      optional: Boolean(it?.optional),
    };
  }).filter((it) => it.name);
}

/** Required items always count; optional ones only when selected. */
function totalOf(items, selectedIds = null) {
  const picked = selectedIds ? new Set(selectedIds) : null;
  return Math.round(items.reduce((sum, it) => (
    !it.optional || (picked ? picked.has(it.id) : false) ? sum + it.price : sum
  ), 0) * 100) / 100;
}

module.exports = { normalizeContent, normalizeItems, totalOf, CURRENCIES, LANGUAGES };
