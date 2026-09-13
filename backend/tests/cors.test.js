const { test } = require('node:test');
const assert   = require('node:assert');
const { isOriginAllowed, loadCorsConfig } = require('../src/lib/cors');

test('same-origin / non-browser requests (no Origin header) are allowed', () => {
  assert.equal(isOriginAllowed(undefined, { allowedOrigins: [], allowedVercelDomains: [] }), true);
});

test('CLIENT_URL is always allowed', () => {
  const cfg = loadCorsConfig({ CLIENT_URL: 'https://mbndev.com' });
  assert.equal(isOriginAllowed('https://mbndev.com', cfg), true);
});

test('an unrelated origin is rejected', () => {
  const cfg = loadCorsConfig({ CLIENT_URL: 'https://mbndev.com' });
  assert.equal(isOriginAllowed('https://evil.example.com', cfg), false);
});

test('a bare *.vercel.app origin is NOT trusted when ALLOWED_VERCEL_DOMAINS is unset', () => {
  const cfg = loadCorsConfig({ CLIENT_URL: 'https://mbndev.com' });
  assert.equal(isOriginAllowed('https://some-attacker-project.vercel.app', cfg), false);
});

test('an explicit narrow preview-domain suffix is trusted', () => {
  const cfg = loadCorsConfig({
    CLIENT_URL: 'https://mbndev.com',
    ALLOWED_VERCEL_DOMAINS: '-mbndev.vercel.app',
  });
  assert.equal(isOriginAllowed('https://feature-branch-mbndev.vercel.app', cfg), true);
  assert.equal(isOriginAllowed('https://some-attacker-project.vercel.app', cfg), false);
});

test('loadCorsConfig flags a bare public-suffix misconfiguration', () => {
  const cfg = loadCorsConfig({ ALLOWED_VERCEL_DOMAINS: '.vercel.app' });
  assert.equal(cfg.hasBarePublicSuffix, true);

  const cfg2 = loadCorsConfig({ ALLOWED_VERCEL_DOMAINS: 'vercel.app' });
  assert.equal(cfg2.hasBarePublicSuffix, true);
});

test('localhost dev origins are always allowed', () => {
  const cfg = loadCorsConfig({});
  assert.equal(isOriginAllowed('http://localhost:3000', cfg), true);
  assert.equal(isOriginAllowed('http://localhost:3001', cfg), true);
});
