// MBN DEV software products sold through the normal order/checkout flow.
// Prices live here (server-side) — the client only sends "leads-ai:pro".

const PRODUCTS = {
  'leads-ai': {
    name:  'MBN Leads AI',
    plans: { starter: 37, pro: 67, agency: 97 },
    model: 'leadsAiAccount',
    path:  '/leads-ai',
    firstStep: 'add your Google key in Settings and run your first search',
  },
  'local-growth': {
    name:  'MBN Local Growth',
    plans: { starter: 37, pro: 67, agency: 97 },
    model: 'localGrowthAccount',
    path:  '/local-growth',
    firstStep: 'add your Google key in Settings and create your first report',
  },
  'support-ai': {
    name:  'MBN Support AI',
    plans: { starter: 37, pro: 67, agency: 97 },
    model: 'supportAiAccount',
    path:  '/support-ai',
    firstStep: 'add your OpenAI key in Settings and create your first assistant',
  },
  'review-booster': {
    name:  'MBN Review Booster',
    plans: { starter: 37, pro: 67, agency: 97 },
    model: 'reviewBoosterAccount',
    path:  '/review-booster',
    firstStep: 'add your business and print its QR poster',
  },
  'proposal-ai': {
    name:  'MBN Proposal AI',
    plans: { starter: 37, pro: 67, agency: 97 },
    model: 'proposalAccount',
    path:  '/proposal-ai',
    firstStep: 'add your brand and OpenAI key in Settings and write your first proposal',
  },
};

const PLAN_RANK = { starter: 1, pro: 2, agency: 3 };

/** "leads-ai:pro" → { key, productId, plan, price, title } or null. */
function parseProduct(value) {
  const [productId, plan] = String(value || '').split(':');
  const product = PRODUCTS[productId];
  if (!product || !Object.prototype.hasOwnProperty.call(product.plans, plan)) return null;
  const label = plan[0].toUpperCase() + plan.slice(1);
  return {
    key: `${productId}:${plan}`, productId, plan, price: product.plans[plan], title: `${product.name} — ${label}`,
    name: product.name, model: product.model, path: product.path, firstStep: product.firstStep,
  };
}

/** Higher of two plans (an upgrade never downgrades an existing licence). */
function higherPlan(a, b) {
  if (!a) return b;
  return (PLAN_RANK[b] || 0) > (PLAN_RANK[a] || 0) ? b : a;
}

module.exports = { PRODUCTS, parseProduct, higherPlan };
