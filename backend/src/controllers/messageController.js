const prisma   = require('../lib/prisma');
const { fmt }  = require('../lib/format');
const realtime = require('../lib/realtime');

// ─── GET /api/messages/threads ───────────────────────────────────────────────
// Returns all project threads with unread counts + last message preview.
// Used to populate the messages sidebar.
exports.getThreads = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId  = req.user.id;

    const projects = await prisma.project.findMany({
      where:   isAdmin ? {} : { clientId: userId },
      select: {
        id:        true,
        title:     true,
        status:    true,
        updatedAt: true,
        client: { select: { id: true, name: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content:   true,
            type:      true,
            createdAt: true,
            sender:    { select: { name: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                OR: [
                  { senderId: { not: userId } },
                  { senderId: null },
                ],
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const threads = projects.map((p) => {
      const last = p.messages[0] || null;
      let lastMessage = null;

      if (last) {
        if (last.type === 'system') {
          try {
            const parsed  = JSON.parse(last.content);
            lastMessage = { text: parsed.title, type: 'system', createdAt: last.createdAt };
          } catch {
            lastMessage = { text: last.content.slice(0, 60), type: 'system', createdAt: last.createdAt };
          }
        } else {
          lastMessage = {
            text:       last.content.slice(0, 60) + (last.content.length > 60 ? '…' : ''),
            senderName: last.sender?.name || 'Unknown',
            type:       'user',
            createdAt:  last.createdAt,
          };
        }
      }

      return {
        projectId:     p.id,
        projectTitle:  p.title,
        projectStatus: p.status,
        client:        isAdmin ? p.client : undefined,
        lastMessage,
        unreadCount:   p._count.messages,
        updatedAt:     p.updatedAt,
      };
    });

    // Conversations with unread messages bubble to top
    threads.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    res.json({ success: true, threads });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages/:projectId ───────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { id: true, clientId: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await prisma.message.findMany({
      where:   { projectId },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Mark all unread messages from others as read in one query
    await prisma.message.updateMany({
      where: {
        projectId,
        isRead: false,
        OR: [
          { senderId: { not: req.user.id } },
          { senderId: null },
        ],
      },
      data: { isRead: true },
    });

    res.json({ success: true, messages: fmt(messages) });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/messages/:projectId ──────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { content }   = req.body;
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { id: true, clientId: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await prisma.message.create({
      data:    { content, projectId, senderId: req.user.id, type: 'user' },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    });

    const payload = { ...fmt(message), projectId };

    if (req.user.role === 'admin') {
      realtime.publishToUser(project.clientId, 'message:new', payload);
    } else {
      realtime.publishToAdmins('message:new', payload);
    }

    res.status(201).json({ success: true, message: payload });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages/unread ────────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        isRead: false,
        project: req.user.role === 'admin' ? {} : { clientId: req.user.id },
        OR: [
          { senderId: { not: req.user.id } },
          { senderId: null },
        ],
      },
    });
    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
};
