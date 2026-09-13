// ─── CORS origin policy ───────────────────────────────────────────────────
// Pulled out of server.js so the allow/deny decision is unit-testable in
// isolation, without booting the whole Express app.
'use strict';

/**
 * @param {string|undefined} origin
 * @param {{ allowedOrigins: string[], allowedVercelDomains: string[] }} config
 * @returns {boolean}
 */
function isOriginAllowed(origin, { allowedOrigins, allowedVercelDomains }) {
  if (!origin) return true; // same-origin / non-browser requests (no Origin header)
  if (allowedOrigins.includes(origin)) return true;
  // Explicit, narrow preview-domain suffixes only — never a bare public
  // suffix like ".vercel.app", which anyone can deploy under.
  return allowedVercelDomains.some((d) => d && origin.endsWith(d));
}

/** Builds the config object from env, applying the fail-safe rules once. */
function loadCorsConfig(env = process.env) {
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://mbndev.vercel.app',
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null,
  ].filter(Boolean);

  const allowedVercelDomains = (env.ALLOWED_VERCEL_DOMAINS || '')
    .split(',').map((d) => d.trim()).filter(Boolean);

  const hasBarePublicSuffix = allowedVercelDomains.some(
    (d) => d === '.vercel.app' || d === 'vercel.app'
  );

  return { allowedOrigins, allowedVercelDomains, hasBarePublicSuffix };
}

module.exports = { isOriginAllowed, loadCorsConfig };
