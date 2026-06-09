/**
 * File storage abstraction.
 *
 * Production (Vercel): uploads go to Vercel Blob — set BLOB_READ_WRITE_TOKEN.
 * Local dev (no token): files are written to backend/uploads and served by
 * the express.static('/uploads') mount in server.js.
 *
 * Without a Blob token on Vercel, files land in /tmp and are LOST when the
 * lambda recycles — a warning is logged so this can't fail silently.
 */
const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const crypto = require('crypto');

const LOCAL_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'mbndev-uploads')
  : path.join(__dirname, '../../uploads');

const hasBlobToken = () => !!process.env.BLOB_READ_WRITE_TOKEN;

if (process.env.VERCEL && !hasBlobToken()) {
  // eslint-disable-next-line no-console
  console.warn(
    '[storage] BLOB_READ_WRITE_TOKEN is not set — uploads will be written to ' +
    '/tmp and disappear when the serverless instance recycles. Create a Blob ' +
    'store in the Vercel dashboard and link it to this project.'
  );
}

/**
 * Persist an uploaded file (multer memoryStorage file object).
 * Returns the public URL to store in the database.
 */
async function saveUpload(file) {
  const ext      = path.extname(file.originalname).toLowerCase();
  const id       = crypto.randomBytes(16).toString('hex');
  const filename = `${Date.now()}-${id}${ext}`;

  if (hasBlobToken()) {
    const { put } = require('@vercel/blob');
    const blob = await put(`project-files/${filename}`, file.buffer, {
      access:      'public',
      contentType: file.mimetype,
    });
    return blob.url;
  }

  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  await fs.promises.writeFile(path.join(LOCAL_DIR, filename), file.buffer);
  return `/uploads/${filename}`;
}

/**
 * Best-effort removal of stored files when their DB rows are deleted.
 * Never throws — orphaned blobs are preferable to a failed user deletion.
 */
async function deleteStoredFiles(urls) {
  const blobUrls = [];
  for (const url of urls) {
    if (!url) continue;
    if (url.startsWith('/uploads/')) {
      const filename = path.basename(url);
      fs.unlink(path.join(LOCAL_DIR, filename), () => {});
    } else if (url.startsWith('https://')) {
      blobUrls.push(url);
    }
  }
  if (blobUrls.length && hasBlobToken()) {
    try {
      const { del } = require('@vercel/blob');
      await del(blobUrls);
    } catch {
      /* best effort */
    }
  }
}

module.exports = { saveUpload, deleteStoredFiles, LOCAL_DIR };
