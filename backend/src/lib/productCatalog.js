// MBN DEV software products sold through the normal order/checkout flow.
// Prices live here (server-side) — the client only sends "leads-ai:pro".

const PRODUCTS = {
  'leads-ai': {
    name:  'MBN Leads AI',
    plans: { starter: 37, pro: 67, agency: 97 },
  },
};

const PLAN_RANK = { starter: 1, pro: 2, agency: 3 };

/** "leads-ai:pro" → { key, productId, plan, price, title } or null. */
function parseProduct(value) {
  const [productId, plan] = String(value || '').split(':');
  const product = PRODUCTS[productId];
  if (!product || !Object.prototype.hasOwnProperty.call(product.plans, plan)) return null;
  const label = plan[0].toUpperCase() + plan.slice(1);
  return { key: `${productId}:${plan}`, productId, plan, price: product.plans[plan], title: `${product.name} — ${label}`, name: product.name };
}

/** Higher of two plans (an upgrade never downgrades an existing licence). */
function higherPlan(a, b) {
  if (!a) return b;
  return (PLAN_RANK[b] || 0) > (PLAN_RANK[a] || 0) ? b : a;
}

module.exports = { PRODUCTS, parseProduct, higherPlan };
