'use strict';

const prisma   = require('../lib/prisma');
const jwt      = require('jsonwebtoken');
const { saveUpload, deleteStoredFiles, BLOB_ACCESS } = require('../lib/storage');
const { fmt }  = require('../lib/format');
const { notify, logActivity } = require('../lib/notifications');
const { SM }   = require('../lib/systemMessages');
const realtime = require('../lib/realtime');
const { sendEmail, templates } = require('../lib/email');
const { telegram }   = require('../lib/telegram');
const { matchesSignature, SIGNATURE_BYTES } = require('../lib/fileSignature');
const { MAX_DIRECT_BYTES, extOf, isAllowedName } = require('../lib/uploadPolicy');
const path = require('path');
const fs = require('fs');
const { PROJECT_STATUS } = require('../lib/constants');

const VALID_PROJECT_STATUSES = Object.values(PROJECT_STATUS);

// ─── Shared query shapes ──────────────────────────────────────────────────────

// Lightweight: used for list views — no activityLogs (expensive join)
const withClientLight = {
  client: { select: { id: true, name: true, email: true, avatar: true, company: true } },
  // Deliberately excludes `url` — files are downloaded through the
  // authenticated GET /:id/files/:fileId route, never by exposing the raw
  // (permanent, unauthenticated) storage URL to the client.
  files: { select: { id: true, name: true, uploadedAt: true, projectId: true } },
  milestones: true,
};

// Full: used for single-project detail — includes recent activity
const withClientFull = {
  ...withClientLight,
  activityLogs: {
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take:    20,
  },
};

// ─── Status label map ─────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:     'Pending Review',
  paid:        'Payment Received',
  'in-progress': 'In Progress',
  review:      'Under Review',
  revision:    'Revision Requested',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

// ─── Create project (client) ──────────────────────────────────────────────────
exports.createProject = async (req, res, next) => {
  try {
    const {
      title, description, type, budget, deadline, features,
      package: pkg, notes, designPreferences,
    } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        type:         type || 'custom',
        budget:       Number(budget),
        deadline:     deadline ? new Date(deadline) : null,
        features:     features || [],
        package:      pkg || 'custom',
        notes:        notes || null,
        designStyle:  designPreferences?.style || null,
        designColors: designPreferences?.colors || [],
        designRefs:   designPreferences?.references || [],
        clientId:     req.user.id,
      },
      include: withClientFull,
    });

    res.status(201).json({ success: true, project: fmt(project) });
  } catch (err) {
    next(err);
  }
};

// ─── Get own projects (client) ────────────────────────────────────────────────
// Uses lightweight include — list views don't need activityLogs
exports.getMyProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where:   { clientId: req.user.id },
      include: withClientLight,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, projects: fmt(projects) });
  } catch (err) {
    next(err);
  }
};

// ─── Get single project (client or admin) ────────────────────────────────────
// Full include — detail view shows activity feed
exports.getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where:   { id: req.params.id },
      include: {
        ...withClientFull,
        messages: {
          include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
          orderBy: { createdAt: 'asc' },
          take:    100, // bounded — client paginates further if needed
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, project: fmt(project) });
  } catch (err) {
    next(err);
  }
};

// ─── Get all projects (admin) ─────────────────────────────────────────────────
exports.getAllProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const search = req.query.search ? String(req.query.search).slice(0, 100) : null;
    const take   = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip   = Math.max((parseInt(page, 10) || 1) - 1, 0) * take;

    const where = {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: withClientLight, // lightweight for list
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success:  true,
      count:    projects.length,
      total,
      page:     parseInt(page, 10) || 1,
      limit:    take,
      projects: fmt(projects),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update project (admin) ───────────────────────────────────────────────────
exports.updateProject = async (req, res, next) => {
  try {
    const { status, progress, notes, deadline, budget } = req.body;

    if (status !== undefined && !VALID_PROJECT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}.`,
      });
    }

    if (progress !== undefined) {
      const p = Number(progress);
      if (isNaN(p) || p < 0 || p > 100) {
        return res.status(400).json({ success: false, message: 'progress must be 0-100' });
      }
    }

    if (budget !== undefined) {
      const b = Number(budget);
      if (isNaN(b) || b < 0) {
        return res.status(400).json({ success: false, message: 'budget must be a non-negative number' });
      }
    }

    const current = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, message: 'Project not found' });

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(status   !== undefined ? { status }                                    : {}),
        ...(progress !== undefined ? { progress: Number(progress) }               : {}),
        ...(notes    !== undefined ? { notes }                                    : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(budget   !== undefined ? { budget: Number(budget) }                  : {}),
      },
      include: withClientLight,
    });

    // Status-change side effects
    if (status && status !== current.status) {
      SM.statusChanged(project.id, { toStatus: status }).catch(() => {});

      // Run notification + activity in parallel
      const [,, fullClient] = await Promise.all([
        notify(project.clientId, {
          type:     'status_update',
          title:    `Project Update: ${STATUS_LABELS[status] || status}`,
          message:  `Your project "${project.title}" status updated to "${STATUS_LABELS[status] || status}".`,
          link:     `/dashboard/client/projects/${project.id}`,
          metadata: { projectId: project.id, status },
        }),
        logActivity(
          project.id,
          req.user.id,
          'status_change',
          `Project status changed from "${STATUS_LABELS[current.status] || current.status}" to "${STATUS_LABELS[status] || status}"`,
          { from: current.status, to: status }
        ),
        prisma.user.findUnique({
          where:  { id: project.clientId },
          select: { email: true, name: true, phone: true },
        }),
      ]);

      if (fullClient?.email) {
        sendEmail({
          to: fullClient.email,
          ...templates.projectStatusUpdate({
            client:     fullClient,
            project,
            fromStatus: STATUS_LABELS[current.status] || current.status,
            toStatus:   STATUS_LABELS[status] || status,
          }),
        }).catch(() => {});
        telegram.projectStatusUpdate({ client: fullClient, project, toStatus: status }).catch(() => {});
      }
    }

    // Progress-change logging
    if (progress !== undefined && Number(progress) !== current.progress) {
      logActivity(
        project.id,
        req.user.id,
        'progress_update',
        `Progress updated to ${progress}%`,
        { from: current.progress, to: Number(progress) }
      ).catch(() => {});
    }

    // Realtime push
    const update = { id: project.id, status: project.status, progress: project.progress, updatedAt: project.updatedAt };
    realtime.publishToUser(project.clientId, 'project:updated', update);
    realtime.publishToAdmins('project:updated', update);

    res.json({ success: true, project: fmt(project) });
  } catch (err) {
    next(err);
  }
};

// ─── Authorize BEFORE multer buffers the file ─────────────────────────────────
// Runs ahead of upload.single('file') in the route chain (see routes/projects.js)
// so a non-owner's request is rejected from just the URL param, before
// multer.memoryStorage() reads the (up to 4MB) request body into memory at
// all. Checking ownership only after uploadFile() ran let any authenticated
// client force repeated full-size memory allocations against arbitrary
// project IDs purely to get rejected afterward.
exports.checkProjectUploadAuth = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where:  { id: req.params.id },
      select: { id: true, clientId: true },
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role !== 'admin' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload to this project' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Upload file to project ───────────────────────────────────────────────────
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Never trust the client-declared extension/MIME type alone — verify the
    // actual bytes match what the filename claims to be, so a renamed
    // arbitrary payload can't slip past the extension/MIME allow-list in
    // middleware/upload.js.
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!matchesSignature(req.file.buffer, ext)) {
      return res.status(400).json({
        success: false,
        message: `File content does not match its extension '${ext}'.`,
      });
    }

    // Ownership was already verified by checkProjectUploadAuth above.
    const fileUrl = await saveUpload(req.file);

    const file = await prisma.projectFile.create({
      data: {
        name:         req.file.originalname.slice(0, 200),
        url:          fileUrl,
        projectId:    req.params.id,
        uploadedById: req.user.id,
      },
    });

    SM.fileUploaded(req.params.id, {
      fileName:     req.file.originalname.slice(0, 100),
      uploaderName: req.user.name,
    }).catch(() => {});

    // Never return the raw storage URL — same reasoning as withClientLight.
    const { url: _url, ...safeFile } = file;
    res.json({ success: true, file: fmt(safeFile) });
  } catch (err) {
    next(err);
  }
};

// ─── Direct uploads (browser → Vercel Blob) ───────────────────────────────────
// Deliverables such as zipped source code are far larger than the ~4.5MB a
// Vercel function accepts per request, so in production the browser uploads
// straight to Blob storage with a short-lived token from this route, then
// registers the finished file with registerUploadedFile below.

const projectPrefix = (projectId) => `project-files/${projectId}/`;

// Tells the dashboard which path to use: direct (Blob configured) or the
// legacy multipart route (local dev).
exports.getUploadMode = (req, res) => {
  res.json({
    success: true,
    direct: !!process.env.BLOB_READ_WRITE_TOKEN,
    maxBytes: process.env.BLOB_READ_WRITE_TOKEN ? MAX_DIRECT_BYTES : require('../lib/uploadPolicy').MAX_LEGACY_BYTES,
  });
};

exports.createUploadToken = async (req, res, next) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(501).json({ success: false, message: 'Direct uploads are not configured on this server.' });
    }
    const { handleUpload } = require('@vercel/blob/client');
    const projectId = req.params.id;
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(projectPrefix(projectId)) || pathname.includes('..')) {
          throw new Error('Invalid upload path');
        }
        if (!isAllowedName(pathname)) {
          throw new Error(`File type '${extOf(pathname) || 'unknown'}' is not allowed`);
        }
        return {
          maximumSizeInBytes: MAX_DIRECT_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 60 * 60 * 1000,
        };
      },
    });
    res.json(result);
  } catch (err) {
    // handleUpload reports policy failures as plain Errors — surface them.
    res.status(400).json({ success: false, message: err.message || 'Could not start the upload' });
  }
};

exports.registerUploadedFile = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { url, name } = req.body || {};
    if (typeof url !== 'string' || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'url and name are required' });
    }
    let parsed;
    try { parsed = new URL(url); } catch { parsed = null; }
    if (!parsed || parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.blob.vercel-storage.com')) {
      return res.status(400).json({ success: false, message: 'Not a storage URL' });
    }
    if (!isAllowedName(name)) {
      return res.status(400).json({ success: false, message: `File type '${extOf(name) || 'unknown'}' is not allowed` });
    }

    const { head, del } = require('@vercel/blob');
    let meta;
    try { meta = await head(url); } catch { meta = null; }
    if (!meta || !meta.pathname.startsWith(projectPrefix(projectId))) {
      return res.status(400).json({ success: false, message: 'Uploaded file not found for this project' });
    }

    // Same rule as the legacy path: the bytes must match the extension.
    // (Private store: reads need the store token.)
    const probe = await fetch(url, {
      headers: { Range: `bytes=0-${SIGNATURE_BYTES - 1}`, Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    const firstBytes = probe.ok ? Buffer.from(await probe.arrayBuffer()) : Buffer.alloc(0);
    if (!matchesSignature(firstBytes, extOf(name))) {
      await del(url).catch(() => {});
      return res.status(400).json({ success: false, message: `File content does not match its extension '${extOf(name)}'.` });
    }

    const existing = await prisma.projectFile.findFirst({ where: { projectId, url }, select: { id: true } });
    if (existing) {
      return res.json({ success: true, file: fmt({ id: existing.id, name, projectId }) });
    }

    const file = await prisma.projectFile.create({
      data: { name: name.slice(0, 200), url, projectId, uploadedById: req.user.id },
    });
    SM.fileUploaded(projectId, {
      fileName:     name.slice(0, 100),
      uploaderName: req.user.name,
    }).catch(() => {});

    const { url: _url, ...safeFile } = file;
    res.json({ success: true, file: fmt(safeFile) });
  } catch (err) {
    next(err);
  }
};

// A small, fixed lookup — the same extensions middleware/upload.js allows —
// rather than adding a mime-type-detection dependency for this alone.
const EXT_CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
  '.zip': 'application/zip', '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain', '.csv': 'text/csv',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.rar': 'application/vnd.rar', '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar', '.gz': 'application/gzip', '.tgz': 'application/gzip',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime',
};

// Shown in the browser; everything else (archives, office files) downloads.
const INLINE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.mp4', '.mov']);

// Above this, files are not streamed through the function (response size
// limit); the authorised request is redirected to a short-lived signed URL.
const PROXY_MAX_BYTES = 4 * 1024 * 1024;
const SIGNED_URL_TTL_MS = 10 * 60 * 1000;

// ─── Download a project file (authenticated) ──────────────────────────────────
// Project deliverables were previously served straight off a public,
// unauthenticated URL (Vercel Blob `access: 'public'`, or a plain
// express.static mount in local dev) — protected only by the filename being
// hard to guess. Any leaked URL granted permanent access with no way to
// revoke it. This proxies the actual bytes through an authorized request
// instead, so the underlying storage URL is never exposed to the client.
exports.downloadProjectFile = async (req, res, next) => {
  try {
    const { id: projectId, fileId } = req.params;

    const file = await prisma.projectFile.findFirst({
      where:  { id: fileId, projectId },
      select: { id: true, name: true, url: true, projectId: true },
    });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const project = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { clientId: true },
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role !== 'admin' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this file' });
    }

    const ext         = path.extname(file.name).toLowerCase();
    const contentType = EXT_CONTENT_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    const safeName = file.name.replace(/["\r\n]/g, '');
    res.setHeader('Content-Disposition', `${INLINE_EXTS.has(ext) ? 'inline' : 'attachment'}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader('Cache-Control', 'private, no-store');

    if (file.url.startsWith('/uploads/')) {
      const { LOCAL_DIR } = require('../lib/storage');
      const localPath = path.join(LOCAL_DIR, path.basename(file.url));
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ success: false, message: 'File no longer exists in storage' });
      }
      return fs.createReadStream(localPath).pipe(res);
    }

    // Remote (Vercel Blob, private store). Nothing is reachable without the
    // store token, so after the ownership check above:
    //  - small files stream through this function;
    //  - large ones (source archives, videos) don't fit in a function
    //    response, so redirect to a signed URL that expires in 10 minutes.
    const blobApi = require('@vercel/blob');
    const meta = await blobApi.head(file.url).catch(() => null);
    if (!meta) {
      return res.status(404).json({ success: false, message: 'File no longer exists in storage' });
    }
    if (meta.size > PROXY_MAX_BYTES) {
      try {
        const validUntil = Date.now() + SIGNED_URL_TTL_MS;
        const signed = await blobApi.issueSignedToken({ pathname: meta.pathname, operations: ['get'], validUntil });
        const { presignedUrl } = await blobApi.presignUrl(signed, {
          operation: 'get', pathname: meta.pathname, access: BLOB_ACCESS, validUntil,
        });
        res.removeHeader('Content-Type');
        res.removeHeader('Content-Disposition');
        return res.redirect(302, presignedUrl);
      } catch {
        // signing unavailable — fall back to streaming below
      }
    }
    const result = await blobApi.get(file.url, { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return res.status(502).json({ success: false, message: 'Could not retrieve the file from storage' });
    }
    if (meta.size) res.setHeader('Content-Length', String(meta.size));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const { Readable } = require('stream');
    Readable.fromWeb(result.stream).pipe(res);
  } catch (err) {
    next(err);
  }
};

// ─── Dashboard stats (admin) ──────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [total, inProgress, completed, pending] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'in-progress' } }),
      prisma.project.count({ where: { status: 'completed' } }),
      prisma.project.count({ where: { status: 'pending' } }),
    ]);
    res.json({ success: true, stats: { total, inProgress, completed, pending } });
  } catch (err) {
    next(err);
  }
};

// ─── Delete project (admin only) ─────────────────────────────────────────────
// Cascades automatically via Prisma onDelete: Cascade to:
//   ProjectFile, Message, Milestone, ActivityLog
// Payments are kept (onDelete: SetNull) but lose their projectId reference.
// Uploaded files on disk are also removed.
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where:  { id: req.params.id },
      include: { files: { select: { url: true } } },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Remove stored files — Vercel Blob or local disk (fire-and-forget)
    if (project.files?.length) {
      deleteStoredFiles(project.files.map((f) => f.url)).catch(() => {});
    }

    // Prisma cascades: Messages, ProjectFiles, Milestones, ActivityLogs all deleted
    await prisma.project.delete({ where: { id: req.params.id } });

    // Notify client that the project was removed
    notify(project.clientId, {
      type:    'status_update',
      title:   'Project Removed',
      message: `Your project "${project.title}" has been removed by the admin.`,
      link:    '/dashboard/client/projects',
    }).catch(() => {});

    // Realtime push to client and admins
    realtime.publishToUser(project.clientId, 'project:deleted', { id: project.id });
    realtime.publishToAdmins('project:deleted', { id: project.id });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Share token (admin only) ─────────────────────────────────────────────────
exports.generateShareToken = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const token    = jwt.sign(
      { projectId: project.id, type: 'share', v: project.shareTokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    const base     = process.env.CLIENT_URL || 'http://localhost:3000';
    const shareUrl = `${base}/share/${token}`;

    res.json({ success: true, token, shareUrl });
  } catch (err) {
    next(err);
  }
};

// ─── Revoke every share link issued for this project ─────────────────────────
// The share token is a stateless 90-day JWT with no per-token record to
// delete — bumping shareTokenVersion invalidates every token issued before
// this call (their embedded `v` no longer matches), without touching
// anything else about the project.
exports.revokeShareTokens = async (req, res, next) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data:  { shareTokenVersion: { increment: 1 } },
      select: { id: true, shareTokenVersion: true },
    });
    res.json({ success: true, message: 'All existing share links for this project have been revoked.', shareTokenVersion: project.shareTokenVersion });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Project not found' });
    next(err);
  }
};

// ─── Get project by share token (public) ─────────────────────────────────────
exports.getProjectByShareToken = async (req, res, next) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired share link' });
    }

    if (decoded.type !== 'share') {
      return res.status(400).json({ success: false, message: 'Invalid share link' });
    }

    const project = await prisma.project.findUnique({
      where:   { id: decoded.projectId },
      include: {
        client:     { select: { name: true, company: true } },
        milestones: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // A token's embedded version must match the project's current one — an
    // admin revoking share links bumps shareTokenVersion, which invalidates
    // every token issued before that call even though they're not otherwise
    // expired. Tokens signed before this field existed have decoded.v ===
    // undefined, which only matches a project still at its default (0).
    if ((decoded.v ?? 0) !== project.shareTokenVersion) {
      return res.status(400).json({ success: false, message: 'This share link has been revoked' });
    }

    res.json({
      success: true,
      project: fmt({
        title:     project.title,
        type:      project.type,
        status:    project.status,
        progress:  project.progress,
        deadline:  project.deadline,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        client: {
          name:    project.client.name,
          company: project.client.company || null,
        },
        milestones: project.milestones.map((m) => ({
          title:   m.title,
          status:  m.status,
          dueDate: m.dueDate,
        })),
      }),
    });
  } catch (err) {
    next(err);
  }
};
