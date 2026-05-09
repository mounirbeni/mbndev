const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const realtime = require('../lib/realtime');

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

    // Push to the *other* side of the conversation in real time.
    // - If client sent → admins see it instantly.
    // - If admin sent  → the project's client sees it instantly.
    const messagePayload = fmt(message);
    if (req.user.role === 'admin') {
      realtime.publishToUser(project.clientId, 'message:new', messagePayload);
    } else {
      realtime.publishToAdmins('message:new', messagePayload);
    }

    res.status(201).json({ success: true, message: messagePayload });
  } catch (err) {
    next(err);
  }
};

// Get unread message count for current user
// Single query with relation filter — replaces the previous N+1 pattern.
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        senderId: { not: req.user.id },
        isRead:   false,
        project:  req.user.role === 'admin' ? {} : { clientId: req.user.id },
      },
    });
    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
};
