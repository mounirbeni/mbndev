'use strict';

const prisma   = require('./prisma');
const realtime = require('./realtime');
const cache    = require('./cache');

// ─── notify ──────────────────────────────────────────────────────────────────
/**
 * Create a Notification record for one user and push it over SSE.
 * Never throws — logs errors instead.
 */
async function notify(userId, { type, title, message, link = null, metadata = null }) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, type, title, message, link, metadata },
    });
    realtime.publishToUser(userId, 'notification:new', {
      id:        notif.id,
      type:      notif.type,
      title:     notif.title,
      message:   notif.message,
      link:      notif.link,
      metadata:  notif.metadata,
      read:      false,
      createdAt: notif.createdAt,
    });
    return notif;
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
    return null;
  }
}

// ─── getAdminIds ─────────────────────────────────────────────────────────────
/**
 * Return active admin user IDs, cached for 2 minutes.
 * Avoids a full-table scan on every admin notification.
 */
async function getAdminIds() {
  return cache.getOrSet(
    cache.KEYS.ADMIN_IDS,
    async () => {
      const admins = await prisma.user.findMany({
        where:  { role: 'admin', isActive: true },
        select: { id: true },
      });
      return admins.map((a) => a.id);
    },
    cache.ADMIN_IDS_TTL,
  );
}

/**
 * Invalidate the cached admin ID list (call after creating/deactivating admins).
 */
function invalidateAdminCache() {
  cache.del(cache.KEYS.ADMIN_IDS);
}

// ─── notifyAdmins ─────────────────────────────────────────────────────────────
/**
 * Notify all active admin users using cached IDs.
 * Each admin gets an individual Notification record for their own read state.
 */
async function notifyAdmins(payload) {
  try {
    const adminIds = await getAdminIds();
    if (adminIds.length === 0) return;
    // Run in parallel but don't let one failure abort the others
    await Promise.allSettled(adminIds.map((id) => notify(id, payload)));
  } catch (err) {
    console.error('[notifyAdmins] Failed to fetch admin IDs:', err.message);
  }
}

// ─── logActivity ─────────────────────────────────────────────────────────────
/**
 * Persist an ActivityLog record and push the event over SSE to the project's
 * client and all admins.
 * Never throws — logs errors instead.
 */
async function logActivity(projectId, userId, action, description, metadata = null) {
  try {
    const [log, project] = await Promise.all([
      prisma.activityLog.create({
        data: { projectId, userId, action, description, metadata },
      }),
      prisma.project.findUnique({
        where:  { id: projectId },
        select: { clientId: true },
      }),
    ]);

    if (project) {
      const event = { projectId, action, description, metadata, createdAt: log.createdAt };
      realtime.publishToUser(project.clientId, 'project:activity', event);
      realtime.publishToAdmins('project:activity', event);
    }

    return log;
  } catch (err) {
    console.error('[logActivity] Failed:', err.message);
    return null;
  }
}

module.exports = { notify, notifyAdmins, logActivity, invalidateAdminCache };
