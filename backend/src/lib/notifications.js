const prisma = require('./prisma');

/**
 * Create a notification for a user.
 * Safe to call — never throws, just logs errors.
 */
async function notify(userId, { type, title, message, link = null, metadata = null }) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link, metadata },
    });
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
  }
}

/**
 * Notify all admin users.
 */
async function notifyAdmins(payload) {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } });
    await Promise.all(admins.map((a) => notify(a.id, payload)));
  } catch (err) {
    console.error('[notifyAdmins] Failed:', err.message);
  }
}

/**
 * Log an activity on a project.
 */
async function logActivity(projectId, userId, action, description, metadata = null) {
  try {
    await prisma.activityLog.create({
      data: { projectId, userId, action, description, metadata },
    });
  } catch (err) {
    console.error('[logActivity] Failed:', err.message);
  }
}

module.exports = { notify, notifyAdmins, logActivity };
