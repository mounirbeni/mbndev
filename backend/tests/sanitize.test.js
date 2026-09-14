const { test } = require('node:test');
const assert   = require('node:assert');
const { sanitizeBody, stripHtml } = require('../src/middleware/sanitize');

function run(req) {
  return new Promise((resolve) => {
    sanitizeBody(req, {}, () => resolve(req));
  });
}

test('stripHtml removes tags but keeps text content', () => {
  assert.equal(stripHtml('<b>hello</b> <script>alert(1)</script>world'), 'hello alert(1)world');
});

test('stripHtml removes an HTML comment', () => {
  assert.equal(stripHtml('hello <!-- a comment --> world'), 'hello  world');
});

test('stripHtml does not mangle plain comparison text containing < and >', () => {
  // Regression: a naive /<[^>]*>/ regex treats "< 5000 and >" as one tag
  // spanning from the first < to the next >, silently eating real content.
  assert.equal(stripHtml('budget < 5000 and > 1000'), 'budget < 5000 and > 1000');
  assert.equal(stripHtml('a<5 and b>3'), 'a<5 and b>3');
  assert.equal(stripHtml('score: 10 < 20, 30 > 5'), 'score: 10 < 20, 30 > 5');
});

test('stripHtml still strips a real tag adjacent to comparison-like text', () => {
  assert.equal(stripHtml('a < 5 <script>evil()</script> b > 3'), 'a < 5 evil() b > 3');
});

test('password fields pass through untouched, regardless of route', async () => {
  const req = {
    method: 'POST',
    path: '/api/auth/register',
    body: { password: '<b>weird</b>pass', newPassword: 'a<1>b', currentPassword: 'x<y>z', name: '<script>evil()</script>' },
  };
  const out = await run(req);
  assert.equal(out.body.password, '<b>weird</b>pass');
  assert.equal(out.body.newPassword, 'a<1>b');
  assert.equal(out.body.currentPassword, 'x<y>z');
  assert.equal(out.body.name, 'evil()'); // non-password fields still sanitized
});

test('sanitizeBody strips HTML from an ordinary route', async () => {
  const req = { method: 'POST', path: '/api/orders', body: { notes: '<img src=x onerror=alert(1)>hi' } };
  const out = await run(req);
  assert.equal(out.body.notes, 'hi');
});

test('sanitizeBody preserves the raw body field on the exempted leads email route', async () => {
  const req = {
    method: 'POST',
    path: '/api/leads/abc123/email',
    body: { subject: 'Hello', body: '<p>Hi <b>there</b></p>' },
  };
  const out = await run(req);
  assert.equal(out.body.body, '<p>Hi <b>there</b></p>'); // untouched — the route sanitizes it itself
  assert.equal(out.body.subject, 'Hello'); // no tags here anyway, unaffected
});

test('the exemption does not leak to a different lead sub-route', async () => {
  const req = {
    method: 'POST',
    path: '/api/leads/abc123/status', // NOT /email
    body: { body: '<script>evil()</script>' },
  };
  const out = await run(req);
  assert.equal(out.body.body, 'evil()'); // stripped, as normal
});

test('the exemption does not leak to a GET on the same path', async () => {
  const req = {
    method: 'GET',
    path: '/api/leads/abc123/email',
    body: { body: '<script>evil()</script>' },
  };
  const out = await run(req);
  assert.equal(out.body.body, 'evil()'); // stripped — exemption only matches POST
});

test('sanitize-html strips a script tag from the exempted email body at the route level', () => {
  const sanitizeHtml = require('sanitize-html');
  const dirty = '<p>Hello</p><script>alert(document.cookie)</script>';
  const clean = sanitizeHtml(dirty, {
    allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  assert.doesNotMatch(clean, /<script/i);
  assert.match(clean, /<p>Hello<\/p>/);
});

test('sanitize-html strips a javascript: link href', () => {
  const sanitizeHtml = require('sanitize-html');
  const dirty = '<a href="javascript:alert(1)">click</a>';
  const clean = sanitizeHtml(dirty, {
    allowedTags: ['a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  assert.doesNotMatch(clean, /javascript:/i);
});
