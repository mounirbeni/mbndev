'use strict';

const path   = require('path');
const fs     = require('fs');
const multer = require('multer');
const prisma = require('../lib/prisma');
const { saveUpload, deleteStoredFiles, BLOB_ACCESS } = require('../lib/storage');
const { matchesSignature } = require('../lib/fileSignature');
const { notifyAdmins } = require('../lib/notifications');
const {
  ROLE_TITLES, STATUSES, CV_EXTS, validateApplication, ensureTable,
} = require('../lib/careers');

const MAX_CV_BYTES = 4 * 1024 * 1024; // under Vercel's ~4.5 MB request ceiling

const CV_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // some browsers label .doc/.docx generically — the signature check decides
]);

// CV upload: PDF / Word only, one file, 4 MB.
exports.cvUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_CV_BYTES, files: 1, fields: 30, fieldSize: 8 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!CV_EXTS.has(ext) || !CV_MIMES.has(file.mimetype)) {
      return cb(Object.assign(new Error('Your CV must be a PDF or Word file.'), { status: 400 }), false);
    }
    cb(null, true);
  },
}).single('cv');

const SAFE_SELECT = {
  id: true, role: true, fullName: true, email: true, phone: true, location: true,
  experienceYears: true, availability: true, weeklyHours: true, expectedRate: true,
  portfolioUrl: true, linkedinUrl: true, languages: true, answers: true, message: true,
  cvName: true, cvSize: true, status: true, adminNotes: true, createdAt: true, updatedAt: true,
};

// ─── Public: submit an application ───────────────────────────────────────────
exports.apply = async (req, res, next) => {
  try {
    const { data, error } = validateApplication(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Please attach your CV (PDF or Word).' });
    const ext = path.extname(file.originalname).toLowerCase();
    if (!matchesSignature(file.buffer, ext)) {
      return res.status(400).json({ success: false, message: 'That file does not look like a valid PDF or Word document.' });
    }

    await ensureTable(prisma);

    // One application per role per email per day is plenty.
    const recent = await prisma.jobApplication.findFirst({
      where:  { email: data.email, role: data.role, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
      select: { id: true },
    });
    if (recent) {
      return res.status(409).json({ success: false, message: 'We already received your application for this role — we will get back to you soon.' });
    }

    const cvUrl  = await saveUpload(file, 'careers');
    const cvName = path.basename(file.originalname).replace(/[^\w.\- ()]/g, '_').slice(0, 120) || `cv${ext}`;

    const application = await prisma.jobApplication.create({
      data:   { ...data, cvUrl, cvName, cvSize: file.size },
      select: { id: true },
    });

    await notifyAdmins({
      type:     'job_application',
      title:    'New job application',
      message:  `${data.fullName} applied for ${ROLE_TITLES[data.role]} (${data.experienceYears} yrs experience).`,
      link:     `/dashboard/admin/careers?id=${application.id}`,
      metadata: { applicationId: application.id },
    });

    res.status(201).json({ success: true, id: application.id });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: list ─────────────────────────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    await ensureTable(prisma);
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const where = {};
    if (typeof req.query.role === 'string' && ROLE_TITLES[req.query.role]) where.role = req.query.role;
    if (typeof req.query.status === 'string' && STATUSES.includes(req.query.status)) where.status = req.query.status;
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email:    { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [applications, total, byStatus] = await Promise.all([
      prisma.jobApplication.findMany({ where, select: SAFE_SELECT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const row of byStatus) counts[row.status] = row._count._all;

    res.json({ success: true, applications, total, page, limit, counts });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: update status / notes ────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const data = {};
    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status' });
      data.status = req.body.status;
    }
    if (req.body.adminNotes !== undefined) {
      data.adminNotes = typeof req.body.adminNotes === 'string' ? req.body.adminNotes.slice(0, 4000) : null;
    }
    const existing = await prisma.jobApplication.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'Application not found' });
    const application = await prisma.jobApplication.update({ where: { id: req.params.id }, data, select: SAFE_SELECT });
    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: delete (row + stored CV) ─────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const existing = await prisma.jobApplication.findUnique({ where: { id: req.params.id }, select: { id: true, cvUrl: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'Application not found' });
    await prisma.jobApplication.delete({ where: { id: existing.id } });
    await deleteStoredFiles([existing.cvUrl]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: download the CV (private blob store) ─────────────────────────────
const CV_TYPES = {
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

exports.downloadCv = async (req, res, next) => {
  try {
    const app = await prisma.jobApplication.findUnique({ where: { id: req.params.id }, select: { cvUrl: true, cvName: true } });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const ext = path.extname(app.cvName).toLowerCase();
    const safeName = app.cvName.replace(/["\r\n]/g, '');
    res.setHeader('Content-Type', CV_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${ext === '.pdf' ? 'inline' : 'attachment'}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (app.cvUrl.startsWith('/uploads/')) {
      const { LOCAL_DIR } = require('../lib/storage');
      const localPath = path.join(LOCAL_DIR, path.basename(app.cvUrl));
      if (!fs.existsSync(localPath)) return res.status(404).json({ success: false, message: 'File no longer exists in storage' });
      return fs.createReadStream(localPath).pipe(res);
    }

    const blobApi = require('@vercel/blob');
    const result = await blobApi.get(app.cvUrl, { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(502).json({ success: false, message: 'Could not retrieve the file from storage' });
    }
    const { Readable } = require('stream');
    Readable.fromWeb(result.stream).pipe(res);
  } catch (err) {
    next(err);
  }
};
