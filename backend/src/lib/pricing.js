// ─── Pricing engine ─────────────────────────────────────────────────────────
// SOURCE OF TRUTH: this must stay in sync with frontend/src/app/request/page.tsx
// The backend ALWAYS recalculates totalPrice — never trust the client's number.

const BASE_PRICES = {
  website:   799,
  ecommerce: 1499,
  dashboard: 2499,
  mobile:    3999,
  custom:    1199,
};

const FEATURE_PRICES = {
  auth:      400,
  payment:   500,
  dashboard: 800,
  multilang: 300,
  seo:       250,
  api:       400,
  hosting:   150,
};

const DELIVERY_DAYS = {
  website:   14,
  ecommerce: 21,
  dashboard: 30,
  mobile:    45,
  custom:    21,
};

const VALID_PLANS = ['starter', 'pro', 'premium', 'custom'];

// Plan inclusions — included items become FREE in the price calculation.
const PACKAGE_INCLUSIONS = {
  starter: {
    label:            'Starter',
    price:            799,
    includedPages:    5,
    includedFeatures: ['seo', 'hosting'],
  },
  pro: {
    label:            'Pro',
    price:            1799,
    includedPages:    10,
    includedFeatures: ['seo', 'hosting', 'auth', 'api'],
  },
  premium: {
    label:            'Premium',
    price:            3499,
    includedPages:    99, // effectively unlimited
    includedFeatures: ['seo', 'hosting', 'auth', 'api', 'payment', 'dashboard', 'multilang'],
  },
};

const PAGE_PRICE = 50;
const FAST_DELIVERY_MULTIPLIER = 0.30; // +30% of base
const FAST_DELIVERY_TIME_MULT  = 0.60; // 40% faster

/**
 * Calculate authoritative price for an order.
 * @param {object} input
 * @param {string} input.serviceType
 * @param {number} [input.pages=5]
 * @param {string[]} [input.features=[]]
 * @param {string[]} [input.addons=[]]
 * @param {string|null} [input.plan]  - 'starter' | 'pro' | 'premium' | null
 */
function calculatePrice({ serviceType, pages = 5, features = [], addons = [], plan = null }) {
  const safePlan       = plan && VALID_PLANS.includes(plan) ? plan : null;
  const pkg            = safePlan ? PACKAGE_INCLUSIONS[safePlan] : null;
  const base           = pkg ? pkg.price : (BASE_PRICES[serviceType] || BASE_PRICES.custom);
  const includedPages  = pkg ? pkg.includedPages : 5;
  const includedFeats  = pkg ? pkg.includedFeatures : [];

  const featureList = Array.isArray(features) ? features : [];
  const addonList   = Array.isArray(addons)   ? addons   : [];

  const pageExtra   = Math.max(0, Number(pages || 5) - includedPages) * PAGE_PRICE;
  const paidFeats   = featureList.filter((k) => !includedFeats.includes(k));
  const featureTotal = paidFeats.reduce((sum, f) => sum + (FEATURE_PRICES[f] || 0), 0);
  const fastAddon   = addonList.includes('fastDelivery')
    ? Math.round(base * FAST_DELIVERY_MULTIPLIER)
    : 0;

  let deliveryDays = DELIVERY_DAYS[serviceType] || 21;
  if (addonList.includes('fastDelivery')) {
    deliveryDays = Math.ceil(deliveryDays * FAST_DELIVERY_TIME_MULT);
  }

  return {
    totalPrice: base + pageExtra + featureTotal + fastAddon,
    deliveryDays,
    breakdown: {
      base,
      pageExtra,
      featureTotal,
      addonTotal: fastAddon,
      includedPages,
      includedFeatures: includedFeats,
      plan: safePlan,
    },
  };
}

module.exports = {
  calculatePrice,
  PACKAGE_INCLUSIONS,
  BASE_PRICES,
  FEATURE_PRICES,
  DELIVERY_DAYS,
  VALID_PLANS,
};
