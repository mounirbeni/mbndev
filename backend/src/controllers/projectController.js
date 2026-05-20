const prisma = require('../lib/prisma');
const jwt    = require('jsonwebtoken');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');
const { SM } = require('../lib/systemMessages');
const realtime = require('../lib/realtime');
const { sendEmail, templates } = require('../lib/email');
const { wa } = require('../lib/whatsapp');

// Shared include for client details on every project query
const withClient = {
  client:   { select: { id: true, name: true, email: true, avatar: true, company: true } },
  files:    true,
  milestones: true,
  activityLogs: {
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take:    20,
  },
};

const STATUS_LABELS = {
  pending:     'Pending Review',
  paid:        'Payment Received',
  'in-progress': 'In Progress',
  review:      'Under Review',
  revision:    'Revision Requested',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

// Client: Submit new project request
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
        type: type || 'custom',
        budget: Number(budget),
        deadline: deadline ? new Date(deadline) : null,
        features: features || [],
        package: pkg || 'custom',
        notes: notes || null,
        designStyle: designPreferences?.style || null,
        designColors: designPreferences?.colors || [],
        designRefs: designPreferences?.references || [],
        clientId: req.user.id,
      },
      include: withClient,
    });

    res.status(201).json({ success: true, project: fmt(project) });
  } catch (err) {
    next(err);
  }
};

// Client: Get own projects
exports.getMyProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { clientId: req.user.id },
      include: withClient,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, projects: fmt(projects) });
  } catch (err) {
    next(err);
  }
};

// Client or Admin: Get single project
exports.getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { ...withClient, messages: { include: { sender: { select: { id: true, name: true, avatar: true, role: true } } } } },
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

// Admin: Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    // Cap search length to defend against ReDoS / huge payloads
    const search = req.query.search ? String(req.query.search).slice(0, 100) : null;
    const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = Math.max((parseInt(page, 10) || 1) - 1, 0) * take;

    const where = {
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: withClient,
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

// Admin: Update project status, progress, notes
exports.updateProject = async (req, res, next) => {
  try {
    const { status, progress, notes, deadline, budget } = req.body;

    // Validate progress range
    if (progress !== undefined) {
      const p = Number(progress);
      if (isNaN(p) || p < 0 || p > 100) {
        return res.status(400).json({ success: false, message: 'progress must be a number between 0 and 100' });
      }
    }

    // Fetch current project for comparison
    const current = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, message: 'Project not found' });

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(status   !== undefined ? { status }                                : {}),
        ...(progress !== undefined ? { progress: Number(progress) }           : {}),
        ...(notes    !== undefined ? { notes }                                : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(budget   !== undefined ? { budget: Number(budget) }              : {}),
      },
      include: withClient,
    });

    // Log status change
    if (status && status !== current.status) {
      // System message in project chat (fire-and-forget)
      SM.statusChanged(project.id, { toStatus: status }).catch(() => {});

      await logActivity(
        project.id,
        req.user.id,
        'status_change',
        `Project status changed from "${STATUS_LABELS[current.status] || current.status}" to "${STATUS_LABELS[status] || status}"`,
        { from: current.status, to: status }
      );

      // Notify client (in-app + realtime)
      await notify(project.clientId, {
        type:    'status_update',
        title:   `Project Update: ${STATUS_LABELS[status] || status}`,
        message: `Your project "${project.title}" status has been updated to "${STATUS_LABELS[status] || status}".`,
        link:    `/dashboard/client/projects/${project.id}`,
        metadata: { projectId: project.id, status },
      });

      // Email the client
      const fullClient = await prisma.user.findUnique({
        where:  { id: project.clientId },
        select: { email: true, name: true, phone: true },
      });
      if (fullClient?.email) {
        await sendEmail({
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

    // Realtime push to client + admins on ANY project update
    realtime.publishToUser(project.clientId, 'project:updated', {
      id: project.id, status: project.status, progress: project.progress,
      updatedAt: project.updatedAt,
    });
    realtime.publishToAdmins('project:updated', {
      id: project.id, status: project.status, progress: project.progress,
      updatedAt: project.updatedAt,
    });

    // Log progress change
    if (progress !== undefined && Number(progress) !== current.progress) {
      await logActivity(
        project.id,
        req.user.id,
        'progress_update',
        `Project progress updated to ${progress}%`,
        { from: current.progress, to: Number(progress) }
      );
    }

    res.json({ success: true, project: fmt(project) });
  } catch (err) {
    next(err);
  }
};

// Upload deliverable file to project
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Ownership check — must run BEFORE accepting the upload to disk
    // (multer has already saved the file at this point — clean up if denied)
    const project = await prisma.project.findUnique({
      where:  { id: req.params.id },
      select: { id: true, clientId: true },
    });

    const denyAndCleanup = (status, message) => {
      // Best-effort cleanup of uploaded file
      try { require('fs').unlinkSync(req.file.path); } catch {}
      return res.status(status).json({ success: false, message });
    };

    if (!project) return denyAndCleanup(404, 'Project not found');
    if (req.user.role !== 'admin' && project.clientId !== req.user.id) {
      return denyAndCleanup(403, 'Not authorized to upload to this project');
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

    // System message in project chat (fire-and-forget)
    SM.fileUploaded(req.params.id, {
      fileName:     req.file.originalname.slice(0, 100),
      uploaderName: req.user.name,
    }).catch(() => {});

    res.json({ success: true, file: fmt(file) });
  } catch (err) {
    next(err);
  }
};

// Admin: Dashboard stats
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

// ─── Generate share token (admin only) ───────────────────────────────────────

exports.generateShareToken = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const token = jwt.sign(
      { projectId: project.id, type: 'share' },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );

    const base = process.env.CLIENT_URL || 'http://localhost:3000';
    const shareUrl = `${base}/share/${token}`;

    res.json({ success: true, token, shareUrl });
  } catch (err) {
    next(err);
  }
};

// ─── Get project by share token (public — no auth) ───────────────────────────

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

    // Return only safe public data — no messages, files, or financial details
    res.json({
      success: true,
      project: fmt({
        title:      project.title,
        type:       project.type,
        status:     project.status,
        progress:   project.progress,
        deadline:   project.deadline,
        createdAt:  project.createdAt,
        updatedAt:  project.updatedAt,
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
