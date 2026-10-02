const multer = require('multer');
const path   = require('path');

const { ALLOWED_EXTS, MAX_LEGACY_BYTES } = require('../lib/uploadPolicy');

// SVG is intentionally excluded: browsers execute JS inside SVG — stored XSS risk.
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/zip', 'application/x-zip-compressed', 'application/x-zip', 'multipart/x-zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/vnd.rar', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'application/x-tar', 'application/gzip', 'application/x-gzip', 'application/x-compressed-tar',
  'video/mp4', 'video/quicktime',
]);

// Browsers often label archives with the generic type; for those formats the
// magic-byte check in the controller is what actually verifies the content.
const GENERIC_OK_EXTS = new Set(['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.csv']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return cb(new Error(`File extension '${ext}' not allowed`), false);
  }
  const genericOk = GENERIC_OK_EXTS.has(ext) && (file.mimetype === 'application/octet-stream' || file.mimetype === '');
  if (!ALLOWED_MIMES.has(file.mimetype) && !genericOk) {
    return cb(new Error(`MIME type '${file.mimetype}' not allowed`), false);
  }
  cb(null, true);
};

// Memory storage: the controller hands the buffer to lib/storage, which
// uploads to Vercel Blob in production or the local uploads dir in dev.
//
// The legacy path's limit lives in lib/uploadPolicy (MAX_LEGACY_BYTES): it
// must stay under Vercel's ~4.5MB request ceiling. Large files go straight
// from the browser to Vercel Blob instead (see createUploadToken).
const MAX_UPLOAD_BYTES = MAX_LEGACY_BYTES;

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
