// ─── WhatsApp via UltraMsg ────────────────────────────────────────────────────
// Uses UltraMsg API to send WhatsApp messages to the admin number.
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

const https = require('https');
const querystring = require('querystring');

const INSTANCE = process.env.ULTRAMSG_INSTANCE;  // e.g. "instance176472"
const TOKEN    = process.env.ULTRAMSG_TOKEN;      // e.g. "0qj2cnstmc0mwaqd"
const ADMIN_WA = process.env.ADMIN_WHATSAPP;      // e.g. "+212601439975"
const APP_URL  = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const configured = !!(INSTANCE && TOKEN && ADMIN_WA);

// ─── Core send ───────────────────────────────────────────────────────────────

function sendWhatsApp(to, message) {
  if (!configured) {
    console.log(`[whatsapp:dev] → ${to}\n${message}\n`);
    return Promise.resolve({ sent: false, reason: 'not_configured' });
  }

  const body = querystring.stringify({ token: TOKEN, to, body: message });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.ultramsg.com',
        path:     `/${INSTANCE}/messages/chat`,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ sent: true });
          } else {
            console.error('[whatsapp] UltraMsg error:', res.statusCode, data.slice(0, 120));
            resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
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

const admin = (msg) => sendWhatsApp(ADMIN_WA, msg);

// ─── Message templates ────────────────────────────────────────────────────────

const wa = {

  // ── New client registered ───────────────────────────────────────────────
  welcome: ({ user }) =>
    admin([
      `👋 *New Client Registered — MBN DEV*`,
      ``,
      `👤 Name: ${user.name}`,
      `📧 Email: ${user.email}`,
      `🏢 Company: ${user.company || '—'}`,
      ``,
      `👉 ${APP_URL}/dashboard/admin/clients`,
    ].join('\n')),

  // ── New order received ──────────────────────────────────────────────────
  newOrder: ({ client, order }) =>
    admin([
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
    admin([
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

  // ── Payment verified ────────────────────────────────────────────────────
  paymentVerified: ({ client, order }) =>
    admin([
      `✅ *Payment Verified — MBN DEV*`,
      ``,
      `👤 Client: ${client.name}`,
      `📌 Project: ${order.title}`,
      `💰 Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      ``,
      `Project is now active. Client notified by email.`,
    ].join('\n')),

  // ── Project status update ───────────────────────────────────────────────
  projectStatusUpdate: ({ client, project, toStatus }) => {
    const labels = {
      pending:       '⏳ Queued',
      active:        '🚀 Started',
      'in-progress': '🔨 In Progress',
      review:        '👀 In Review',
      revision:      '🔄 Revision',
      completed:     '✅ Completed',
      cancelled:     '❌ Cancelled',
    };
    return admin([
      `📊 *Project Updated — MBN DEV*`,
      ``,
      `👤 Client: ${client.name}`,
      `📌 Project: ${project.title}`,
      `📈 Status: ${labels[toStatus] || toStatus}`,
      ``,
      `👉 ${APP_URL}/dashboard/admin/projects/${project.id}`,
    ].join('\n'));
  },

  // ── New message from client ─────────────────────────────────────────────
  newClientMessage: ({ client, project, preview }) =>
    admin([
      `💬 *New Message — MBN DEV*`,
      ``,
      `👤 From: ${client.name}`,
      project ? `📌 Project: ${project.title}` : '',
      preview ? `📝 "${preview}"` : '',
      ``,
      `👉 ${APP_URL}/dashboard/admin/messages`,
    ].filter(Boolean).join('\n')),

};

module.exports = { sendWhatsApp, wa };
