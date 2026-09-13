const multer = require('multer');
const path   = require('path');

// SVG is intentionally excluded: browsers execute JS inside SVG — stored XSS risk.
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/zip', 'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const ALLOWED_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.zip', '.doc', '.docx', '.txt',
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return cb(new Error(`File extension '${ext}' not allowed`), false);
  }
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(new Error(`MIME type '${file.mimetype}' not allowed`), false);
  }
  cb(null, true);
};

// Memory storage: the controller hands the buffer to lib/storage, which
// uploads to Vercel Blob in production or the local uploads dir in dev.
//
// The limit here MUST stay under Vercel's platform-level request body
// ceiling for Node serverless functions (~4.5MB) — that ceiling rejects an
// oversized request before it ever reaches this code, with a generic 413
// instead of the friendly message the error handler in server.js gives for
// LIMIT_FILE_SIZE. 4MB leaves headroom for multipart boundary/header
// overhead on top of the raw file bytes.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files:    1,
  },
});

module.exports = upload;
module.exports.ALLOWED_EXTS    = ALLOWED_EXTS;
module.exports.ALLOWED_MIMES   = ALLOWED_MIMES;
module.exports.fileFilter      = fileFilter;
module.exports.MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES;
