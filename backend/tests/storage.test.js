const { test } = require('node:test');
const assert   = require('node:assert');
const fs       = require('fs');
const path     = require('path');
const { saveUpload, deleteStoredFiles, LOCAL_DIR } = require('../src/lib/storage');

// Without BLOB_READ_WRITE_TOKEN, saveUpload uses the local-disk fallback.

test('saveUpload writes locally and returns a /uploads URL', async () => {
  const url = await saveUpload({
    originalname: 'note.txt',
    mimetype:     'text/plain',
    buffer:       Buffer.from('hello world'),
  });

  assert.match(url, /^\/uploads\/\d+-[a-f0-9]{32}\.txt$/);

  const filePath = path.join(LOCAL_DIR, path.basename(url));
  assert.equal(fs.readFileSync(filePath, 'utf8'), 'hello world');

  fs.unlinkSync(filePath);
});

test('saveUpload preserves the file extension', async () => {
  const url = await saveUpload({
    originalname: 'design.PDF',
    mimetype:     'application/pdf',
    buffer:       Buffer.from('%PDF-fake'),
  });

  assert.ok(url.endsWith('.pdf'));
  fs.unlinkSync(path.join(LOCAL_DIR, path.basename(url)));
});

test('deleteStoredFiles never throws on bad input', async () => {
  await assert.doesNotReject(
    deleteStoredFiles([null, '', '/uploads/does-not-exist.txt', 'https://example.com/x'])
  );
});
