const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// Shared include for client details on every project query
const withClient = {
  client: { select: { id: true, name: true, email: true, avatar: true, company: true } },
  files: true,
  milestones: true,
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
    const { status, search } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: withClient,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: projects.length, projects: fmt(projects) });
  } catch (err) {
    next(err);
  }
};

// Admin: Update project status, progress, notes
exports.updateProject = async (req, res, next) => {
  try {
    const { status, progress, notes, deadline, budget } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(progress !== undefined ? { progress: Number(progress) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(budget !== undefined ? { budget: Number(budget) } : {}),
      },
      include: withClient,
    });

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

    const fileUrl = `/uploads/${req.file.filename}`;

    const file = await prisma.projectFile.create({
      data: {
        name: req.file.originalname,
        url: fileUrl,
        projectId: req.params.id,
        uploadedById: req.user.id,
      },
    });

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
