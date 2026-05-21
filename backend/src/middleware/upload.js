const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
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
