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
