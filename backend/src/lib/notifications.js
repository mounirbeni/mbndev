const prisma   = require('./prisma');
const realtime = require('./realtime');

/**
 * Create a notification for a user AND push it over the realtime stream.
 * Safe to call — never throws, just logs errors.
 */
async function notify(userId, { type, title, message, link = null, metadata = null }) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, type, title, message, link, metadata },
    });
    // Push to user's open SSE connections (if any) for instant UI update
    realtime.publishToUser(userId, 'notification:new', {
      id: notif.id, type: notif.type, title: notif.title, message: notif.message,
      link: notif.link, metadata: notif.metadata, read: false,
      createdAt: notif.createdAt,
    });
    return notif;
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
    return null;
  }
}

/**
 * Notify all admin users.
 */
async function notifyAdmins(payload) {
  try {
    const admins = await prisma.user.findMany({
      where:  { role: 'admin', isActive: true },
      select: { id: true },
    });
    await Promise.all(admins.map((a) => notify(a.id, payload)));
  } catch (err) {
    console.error('[notifyAdmins] Failed:', err.message);
  }
}

/**
 * Log an activity on a project AND push to realtime listeners.
 */
async function logActivity(projectId, userId, action, description, metadata = null) {
  try {
    const log = await prisma.activityLog.create({
      data: { projectId, userId, action, description, metadata },
    });

    // Notify the project's client and all admins of the activity
    const project = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { id: true, clientId: true, status: true },
    });

    if (project) {
      const event = {
        projectId,
        action,
        description,
        metadata,
        createdAt: log.createdAt,
      };
      realtime.publishToUser(project.clientId, 'project:activity', event);
      realtime.publishToAdmins('project:activity', event);
    }

    return log;
  } catch (err) {
    console.error('[logActivity] Failed:', err.message);
    return null;
  }
}

module.exports = { notify, notifyAdmins, logActivity };
