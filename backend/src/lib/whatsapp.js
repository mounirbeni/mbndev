// ─── WhatsApp Business Cloud API ─────────────────────────────────────────────
// Uses Meta's WhatsApp Cloud API (no extra packages — built-in https).
// Falls back to stdout in dev when credentials are not configured.
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

const https = require('https');

const TOKEN    = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const ADMIN_WA = process.env.ADMIN_WHATSAPP;   // e.g. "212612345678"
const APP_URL  = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const configured = !!(TOKEN && PHONE_ID);

// ─── Core send ───────────────────────────────────────────────────────────────

function sendWhatsApp(to, message) {
  if (!to) return Promise.resolve({ sent: false, reason: 'no_recipient' });

  // Normalise number — strip spaces, dashes, leading +
  const phone = String(to).replace(/[\s\-()]/g, '').replace(/^\+/, '');

  if (!configured) {
    console.log(`[whatsapp:dev] → ${phone}\n${message}\n`);
    return Promise.resolve({ sent: false, reason: 'not_configured' });
  }

  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to:   phone,
    type: 'text',
    text: { body: message, preview_url: false },
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'graph.facebook.com',
        path:     `/v20.0/${PHONE_ID}/messages`,
        method:   'POST',
        headers:  {
          Authorization:  `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ sent: true, id: json.messages?.[0]?.id });
            } else {
              console.error('[whatsapp] send failed:', json.error?.message || data);
              resolve({ sent: false, reason: json.error?.message || `HTTP ${res.statusCode}` });
            }
          } catch {
            resolve({ sent: false, reason: 'parse_error' });
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error('[whatsapp] request error:', err.message);
      resolve({ sent: false, reason: err.message });
    });
    req.write(body);
    req.end();
  });
}

// ─── Message templates ────────────────────────────────────────────────────────

const wa = {

  // ── Admin: new order received ───────────────────────────────────────────
  newOrder: ({ client, order }) =>
    sendWhatsApp(ADMIN_WA, [
      `🛒 *New Order — MBN DEV*`,
      ``,
      `👤 Client: ${client.name}`,
      `📧 Email: ${client.email}`,
      `📌 Project: ${order.title}`,
      `💰 Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      `🔧 Service: ${order.serviceType || 'Custom'}`,
      `📅 Delivery: ${order.deliveryDays} business days`,
      ``,
      `👉 ${APP_URL}/dashboard/admin/orders`,
    ].join('\n')),

  // ── Admin: payment submitted (needs verification) ───────────────────────
  paymentSubmitted: ({ client, order, method }) =>
    sendWhatsApp(ADMIN_WA, [
      `💳 *Payment Submitted — Action Required*`,
      ``,
      `👤 Client: ${client.name}`,
      `📧 Email: ${client.email}`,
      `📌 Project: ${order.title}`,
      `💰 Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      `🏦 Method: ${method}`,
      ``,
      `⚡ Verify to activate the project automatically.`,
      `👉 ${APP_URL}/dashboard/admin/payments`,
    ].join('\n')),

  // ── Admin: new message from client ──────────────────────────────────────
  newClientMessage: ({ client, project, preview }) =>
    sendWhatsApp(ADMIN_WA, [
      `💬 *New Message — MBN DEV*`,
      ``,
      `👤 From: ${client.name}`,
      project ? `📌 Project: ${project.title}` : '',
      preview ? `📝 "${preview}"` : '',
      ``,
      `👉 ${APP_URL}/dashboard/admin/messages`,
    ].filter(Boolean).join('\n')),

  // ── Client: payment verified ─────────────────────────────────────────────
  paymentVerified: ({ client, order, projectId }) =>
    client.phone
      ? sendWhatsApp(client.phone, [
          `✅ *Payment Verified — MBN DEV*`,
          ``,
          `Hi ${client.name.split(' ')[0]}, your payment has been verified! 🎉`,
          ``,
          `📌 Project: ${order.title}`,
          `💰 Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
          ``,
          `Work starts immediately. Track progress in your dashboard:`,
          `👉 ${APP_URL}/dashboard/client/projects/${projectId}`,
          ``,
          `Questions? Reply here or message us on the platform.`,
        ].join('\n'))
      : Promise.resolve({ sent: false, reason: 'no_client_phone' }),

  // ── Client: project status update ────────────────────────────────────────
  projectStatusUpdate: ({ client, project, toStatus }) => {
    const labels = {
      pending:    '⏳ Queued',
      active:     '🚀 Started',
      in_review:  '👀 In Review',
      revision:   '🔄 In Revision',
      delivered:  '📦 Delivered',
      completed:  '✅ Completed',
      cancelled:  '❌ Cancelled',
    };
    const statusLine = labels[toStatus] || toStatus;
    return client.phone
      ? sendWhatsApp(client.phone, [
          `📊 *Project Update — MBN DEV*`,
          ``,
          `Hi ${client.name.split(' ')[0]}!`,
          ``,
          `📌 Project: ${project.title}`,
          `📈 Status: ${statusLine}`,
          ``,
          toStatus === 'in_review'
            ? `A deliverable is ready for your review. Please check and share feedback.`
            : toStatus === 'delivered'
            ? `Your project has been delivered! Review everything and confirm when satisfied.`
            : toStatus === 'completed'
            ? `Your project is complete. Source files have been handed over. 🎉`
            : `Your project status has been updated.`,
          ``,
          `👉 ${APP_URL}/dashboard/client/projects/${project.id}`,
        ].join('\n'))
      : Promise.resolve({ sent: false, reason: 'no_client_phone' });
  },

  // ── Client: welcome ──────────────────────────────────────────────────────
  welcome: ({ user }) =>
    user.phone
      ? sendWhatsApp(user.phone, [
          `👋 *Welcome to MBN DEV!*`,
          ``,
          `Hi ${user.name.split(' ')[0]}, your account is ready.`,
          ``,
          `🚀 Request your first project:`,
          `👉 ${APP_URL}/request`,
          ``,
          `📊 Your dashboard:`,
          `👉 ${APP_URL}/dashboard/client`,
          ``,
          `Any questions? Just reply to this message.`,
        ].join('\n'))
      : Promise.resolve({ sent: false, reason: 'no_client_phone' }),

};

module.exports = { sendWhatsApp, wa };
