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

test('accepts a .rar sent with the generic octet-stream type (browsers do this)', async () => {
  const { err, accepted } = await runFilter('source-code.rar', 'application/octet-stream');
  assert.equal(err, null);
  assert.equal(accepted, true);
});

test('generic octet-stream is NOT accepted for an image extension', async () => {
  const { err } = await runFilter('photo.png', 'application/octet-stream');
  assert.ok(err instanceof Error);
});

test('upload policy: code archives and videos allowed, svg and exe not', () => {
  const { isAllowedName } = require('../src/lib/uploadPolicy');
  for (const n of ['site.zip', 'src.RAR', 'build.7z', 'app.tar.gz', 'demo.mp4', 'brief.xlsx']) assert.equal(isAllowedName(n), true, n);
  for (const n of ['logo.svg', 'setup.exe', 'script.sh', 'noext']) assert.equal(isAllowedName(n), false, n);
});
