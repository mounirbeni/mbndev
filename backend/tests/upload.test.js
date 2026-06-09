const { test } = require('node:test');
const assert   = require('node:assert');
const { fileFilter } = require('../src/middleware/upload');

function runFilter(originalname, mimetype) {
  return new Promise((resolve) => {
    fileFilter({}, { originalname, mimetype }, (err, accepted) => {
      resolve({ err, accepted });
    });
  });
}

test('accepts an allowed image', async () => {
  const { err, accepted } = await runFilter('photo.png', 'image/png');
  assert.equal(err, null);
  assert.equal(accepted, true);
});

test('accepts a PDF', async () => {
  const { err, accepted } = await runFilter('contract.pdf', 'application/pdf');
  assert.equal(err, null);
  assert.equal(accepted, true);
});

test('rejects SVG (stored XSS vector)', async () => {
  const { err } = await runFilter('logo.svg', 'image/svg+xml');
  assert.ok(err instanceof Error);
});

test('rejects executables', async () => {
  const { err } = await runFilter('setup.exe', 'application/x-msdownload');
  assert.ok(err instanceof Error);
});

test('rejects allowed extension with disallowed MIME (spoofing)', async () => {
  const { err } = await runFilter('image.png', 'application/x-msdownload');
  assert.ok(err instanceof Error);
});

test('extension check is case-insensitive', async () => {
  const { err, accepted } = await runFilter('PHOTO.JPG', 'image/jpeg');
  assert.equal(err, null);
  assert.equal(accepted, true);
});
