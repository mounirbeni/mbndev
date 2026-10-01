'use strict';

const webpush = require('web-push');
const prisma = require('./prisma');

const ready = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (ready) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@mbndev.ma', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

async function sendPush(userId, payload) {
  if (!ready) return;
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload), { TTL: 60 * 60 });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
      else console.error('[push] delivery failed:', error.message);
    }
  }));
}

module.exports = { sendPush, isConfigured: () => ready };
