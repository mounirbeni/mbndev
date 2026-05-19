// ─── WhatsApp via CallMeBot ───────────────────────────────────────────────────
// CallMeBot is a free service that sends WhatsApp messages to a single
// registered number (the admin). No Meta Business account required.
//
// Setup (one-time, 1 minute):
//   1. Open WhatsApp and message +34 644 57 52 87
//   2. Send exactly: "I allow callmebot to send me messages"
//   3. You'll receive your API key — add it to CALLMEBOT_API_KEY in .env
//
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

const https = require('https');

const API_KEY   = process.env.CALLMEBOT_API_KEY;
const ADMIN_WA  = process.env.ADMIN_WHATSAPP;   // e.g. "212612345678" (no +)
const APP_URL   = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const configured = !!(API_KEY && ADMIN_WA);

// ─── Core send ───────────────────────────────────────────────────────────────

function sendWhatsApp(message) {
  if (!configured) {
    console.log(`[whatsapp:dev]\n${message}\n`);
    return Promise.resolve({ sent: false, reason: 'not_configured' });
  }

  const phone = String(ADMIN_WA).replace(/[\s\-()]/g, '').replace(/^\+/, '');
  const text  = encodeURIComponent(message);
  const path  = `/whatsapp.php?phone=${phone}&text=${text}&apikey=${API_KEY}`;

  return new Promise((resolve) => {
    https.get({ hostname: 'api.callmebot.com', path }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ sent: true });
        } else {
          console.error('[whatsapp] CallMeBot error:', res.statusCode, data.slice(0, 120));
          resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (err) => {
      console.error('[whatsapp] request error:', err.message);
      resolve({ sent: false, reason: err.message });
    });
  });
}

// ─── Message templates ────────────────────────────────────────────────────────

const wa = {

  // ── New order received ──────────────────────────────────────────────────
  newOrder: ({ client, order }) =>
    sendWhatsApp([
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

  // ── Payment submitted (needs verification) ──────────────────────────────
  paymentSubmitted: ({ client, order, method }) =>
    sendWhatsApp([
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

  // ── New message from client ─────────────────────────────────────────────
  newClientMessage: ({ client, project, preview }) =>
    sendWhatsApp([
      `💬 *New Message — MBN DEV*`,
      ``,
      `👤 From: ${client.name}`,
      project ? `📌 Project: ${project.title}` : '',
      preview ? `📝 "${preview}"` : '',
      ``,
      `👉 ${APP_URL}/dashboard/admin/messages`,
    ].filter(Boolean).join('\n')),

  // ── Payment verified (admin info only — email handles client) ───────────
  paymentVerified: ({ client, order }) =>
    sendWhatsApp([
      `✅ *Payment Verified — MBN DEV*`,
      ``,
      `👤 Client: ${client.name}`,
      `📌 Project: ${order.title}`,
      `💰 Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      ``,
      `Project is now active. Client has been notified by email.`,
    ].join('\n')),

  // ── Project status update (admin info only — email handles client) ──────
  projectStatusUpdate: ({ client, project, toStatus }) => {
    const labels = {
      pending:     '⏳ Queued',
      active:      '🚀 Started',
      'in-progress': '🔨 In Progress',
      review:      '👀 In Review',
      revision:    '🔄 Revision',
      completed:   '✅ Completed',
      cancelled:   '❌ Cancelled',
    };
    return sendWhatsApp([
      `📊 *Project Updated — MBN DEV*`,
      ``,
      `👤 Client: ${client.name}`,
      `📌 Project: ${project.title}`,
      `📈 Status: ${labels[toStatus] || toStatus}`,
      ``,
      `👉 ${APP_URL}/dashboard/admin/projects/${project.id}`,
    ].join('\n'));
  },

  // ── New client registered ───────────────────────────────────────────────
  welcome: ({ user }) =>
    sendWhatsApp([
      `👋 *New Client Registered — MBN DEV*`,
      ``,
      `👤 Name: ${user.name}`,
      `📧 Email: ${user.email}`,
      `🏢 Company: ${user.company || '—'}`,
      ``,
      `👉 ${APP_URL}/dashboard/admin/clients`,
    ].join('\n')),

};

module.exports = { sendWhatsApp, wa };
