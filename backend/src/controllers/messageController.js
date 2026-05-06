const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// Get all messages for a project
exports.getMessages = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      select: { id: true, clientId: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await prisma.message.findMany({
      where: { projectId: req.params.projectId },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages from others as read
    await prisma.message.updateMany({
      where: {
        projectId: req.params.projectId,
        senderId: { not: req.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Upsert read receipts for messages the current user just read
    const unreadIds = messages
      .filter((m) => m.senderId !== req.user.id && !m.isRead)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await Promise.all(
        unreadIds.map((messageId) =>
          prisma.messageRead.upsert({
            where: { messageId_userId: { messageId, userId: req.user.id } },
            create: { messageId, userId: req.user.id },
            update: {},
          })
        )
      );
    }

    res.json({ success: true, messages: fmt(messages) });
  } catch (err) {
    next(err);
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      select: { id: true, clientId: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        projectId: req.params.projectId,
        senderId: req.user.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    res.status(201).json({ success: true, message: fmt(message) });
  } catch (err) {
    next(err);
  }
};

// Get unread message count for current user
exports.getUnreadCount = async (req, res, next) => {
  try {
    let projectIds;

    if (req.user.role === 'admin') {
      const projects = await prisma.project.findMany({ select: { id: true } });
      projectIds = projects.map((p) => p.id);
    } else {
      const projects = await prisma.project.findMany({
        where: { clientId: req.user.id },
        select: { id: true },
      });
      projectIds = projects.map((p) => p.id);
    }

    const count = await prisma.message.count({
      where: {
        projectId: { in: projectIds },
        senderId: { not: req.user.id },
        isRead: false,
      },
    });

    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
};
