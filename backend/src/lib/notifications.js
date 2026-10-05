'use strict';

const prisma   = require('./prisma');
const realtime = require('./realtime');
const cache    = require('./cache');
const { sendPush } = require('./push');

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
    sendPush(userId, { title: notif.title, body: notif.message, url: notif.link || '/dashboard/client' }).catch(() => {});
    return notif;
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
    return null;
  }
}

// ─── notifyClient ────────────────────────────────────────────────────────────
/**
 * Tell a client about something we did: in-app notification + web push and,
 * with `email: true`, the same update by email (for anything they must not
 * miss when they aren't signed in). Never throws; callers should `await` it
 * so Vercel doesn't freeze the function before the push/email goes out.
 */
async function notifyClient(userId, payload, { email = false } = {}) {
  const tasks = [notify(userId, payload)];
  if (email) {
    tasks.push((async () => {
      const client = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      if (!client?.email) return;
      const { sendEmail, templates } = require('./email');
      await sendEmail({ to: client.email, ...templates.clientUpdate({ client, ...payload }) });
    })().catch((err) => console.error('[notifyClient] email failed:', err.message)));
  }
  await Promise.allSettled(tasks);
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
 * Each admin gets an individual Notification record (in-app + web push) for
 * their own read state, and the same alert goes to the admin Telegram chat
 * unless the caller already sends a dedicated Telegram message.
 *
 * Never throws. Callers should `await` it: on Vercel the function can be
 * frozen once the response is sent, dropping an un-awaited push.
 */
async function notifyAdmins(payload, { telegram: toTelegram = true } = {}) {
  const tasks = [];
  if (toTelegram) {
    const { telegram } = require('./telegram');
    tasks.push(telegram.adminAlert(payload));
  }
  try {
    const adminIds = await getAdminIds();
    tasks.push(...adminIds.map((id) => notify(id, payload)));
  } catch (err) {
    console.error('[notifyAdmins] Failed to fetch admin IDs:', err.message);
  }
  // Run in parallel but don't let one failure abort the others
  await Promise.allSettled(tasks);
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

module.exports = { notify, notifyClient, notifyAdmins, logActivity, invalidateAdminCache };
