'use strict';

const prisma   = require('../lib/prisma');
const { fmt }  = require('../lib/format');
const realtime = require('../lib/realtime');

const MESSAGE_PAGE_SIZE = 50; // messages per page

// ─── GET /api/messages/threads ───────────────────────────────────────────────
exports.getThreads = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId  = req.user.id;

    const projects = await prisma.project.findMany({
      where:  isAdmin ? {} : { clientId: userId },
      select: {
        id:        true,
        title:     true,
        status:    true,
        updatedAt: true,
        client: { select: { id: true, name: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take:    1,
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
            const parsed = JSON.parse(last.content);
            lastMessage  = { text: parsed.title, type: 'system', createdAt: last.createdAt };
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

    // Conversations with unread messages bubble to the top
    threads.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    res.json({ success: true, threads });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages/:projectId ────────────────────────────────────────────
// Supports cursor-based pagination via ?before=<messageId>
// Returns up to MESSAGE_PAGE_SIZE messages in ascending time order.
exports.getMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { before }    = req.query; // cursor: fetch messages older than this ID

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

    // Resolve cursor to a timestamp
    let cursorFilter = {};
    if (before) {
      const cursorMsg = await prisma.message.findUnique({
        where:  { id: before },
        select: { createdAt: true },
      });
      if (cursorMsg) {
        cursorFilter = { createdAt: { lt: cursorMsg.createdAt } };
      }
    }

    const messages = await prisma.message.findMany({
      where:   { projectId, ...cursorFilter },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'desc' }, // fetch newest-first for cursor, then reverse
      take:    MESSAGE_PAGE_SIZE,
    });

    // Reverse so client receives chronological order
    messages.reverse();

    // Mark fetched messages from others as read (only the visible page)
    const unreadIds = messages
      .filter((m) => !m.isRead && m.senderId !== req.user.id)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      prisma.message.updateMany({
        where: { id: { in: unreadIds } },
        data:  { isRead: true },
      }).catch(() => {}); // fire-and-forget — don't block the response
    }

    res.json({
      success:  true,
      messages: fmt(messages),
      hasMore:  messages.length === MESSAGE_PAGE_SIZE,
      // oldest message ID is the next cursor for "load more" (load older)
      nextCursor: messages.length > 0 ? messages[0].id : null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/messages/:projectId ───────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { content }   = req.body;
    const { projectId } = req.params;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

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
      data:    { content: content.trim(), projectId, senderId: req.user.id, type: 'user' },
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

// ─── GET /api/messages/unread ─────────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        isRead:  false,
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
