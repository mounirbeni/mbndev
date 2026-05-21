'use strict';

const prisma   = require('../lib/prisma');
const jwt      = require('jsonwebtoken');
const fs       = require('fs');
const { fmt }  = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');
const { SM }   = require('../lib/systemMessages');
const realtime = require('../lib/realtime');
const { sendEmail, templates } = require('../lib/email');
const { wa }   = require('../lib/whatsapp');

// ─── Shared query shapes ──────────────────────────────────────────────────────

// Lightweight: used for list views — no activityLogs (expensive join)
const withClientLight = {
  client:     { select: { id: true, name: true, email: true, avatar: true, company: true } },
  files:      true,
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

    if (progress !== undefined) {
      const p = Number(progress);
      if (isNaN(p) || p < 0 || p > 100) {
        return res.status(400).json({ success: false, message: 'progress must be 0-100' });
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
        wa.projectStatusUpdate({ client: fullClient, project, toStatus: status }).catch(() => {});
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

// ─── Upload file to project ───────────────────────────────────────────────────
exports.uploadFile = async (req, res, next) => {
  // Helper: delete uploaded file and return error
  const denyAndClean = (status, message) => {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(status).json({ success: false, message });
  };

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const project = await prisma.project.findUnique({
      where:  { id: req.params.id },
      select: { id: true, clientId: true },
    });

    if (!project) return denyAndClean(404, 'Project not found');
    if (req.user.role !== 'admin' && project.clientId !== req.user.id) {
      return denyAndClean(403, 'Not authorized to upload to this project');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

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

    res.json({ success: true, file: fmt(file) });
  } catch (err) {
    // Clean up orphaned file on unexpected error
    if (req.file?.path) fs.unlink(req.file.path, () => {});
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

// ─── Share token (admin only) ─────────────────────────────────────────────────
exports.generateShareToken = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const token    = jwt.sign(
      { projectId: project.id, type: 'share' },
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
