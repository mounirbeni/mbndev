const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');
const os     = require('os');

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

// On Vercel (and any read-only Lambda filesystem) the bundle directory is
// immutable. Write to /tmp instead, which is always writable at runtime.
const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'mbndev-uploads')
  : path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Random unguessable name — preserves original extension only
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTS.has(ext) ? ext : '';
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${id}${safeExt}`);
  },
});

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files:    1,
  },
});

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
