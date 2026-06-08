// ─── Telegram Bot Notifications ───────────────────────────────────────────────
// Uses the official Telegram Bot API — free, never blocks accounts.
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

const https   = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
const APP_URL   = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

const configured = !!(BOT_TOKEN && CHAT_ID);

// ─── Core send ───────────────────────────────────────────────────────────────

function sendTelegram(message) {
  if (!configured) {
    console.log(`[telegram:dev]\n${message}\n`);
    return Promise.resolve({ sent: false, reason: 'not_configured' });
  }

  const body = JSON.stringify({
    chat_id:    CHAT_ID,
    text:       message,
    parse_mode: 'Markdown',
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path:     `/bot${BOT_TOKEN}/sendMessage`,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json',
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
            console.error('[telegram] error:', res.statusCode, data.slice(0, 120));
            resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error('[telegram] request error:', err.message);
      resolve({ sent: false, reason: err.message });
    });
    req.write(body);
    req.end();
  });
}

// ─── Message templates ────────────────────────────────────────────────────────

const wa = {

  welcome: ({ user }) =>
    sendTelegram([
      `*New Client Registered — MBN DEV*`,
      ``,
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Company: ${user.company || '—'}`,
      ``,
      `${APP_URL}/dashboard/admin/clients`,
    ].join('\n')),

  newOrder: ({ client, order }) =>
    sendTelegram([
      `*New Order — MBN DEV*`,
      ``,
      `Client: ${client.name}`,
      `Email: ${client.email}`,
      `Project: ${order.title}`,
      `Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      `Service: ${order.serviceType || 'Custom'}`,
      `Delivery: ${order.deliveryDays} business days`,
      ``,
      `${APP_URL}/dashboard/admin/orders`,
    ].join('\n')),

  paymentSubmitted: ({ client, order, method }) =>
    sendTelegram([
      `*Payment Submitted — Action Required*`,
      ``,
      `Client: ${client.name}`,
      `Email: ${client.email}`,
      `Project: ${order.title}`,
      `Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      `Method: ${method}`,
      ``,
      `Verify to activate the project automatically.`,
      `${APP_URL}/dashboard/admin/payments`,
    ].join('\n')),

  paymentVerified: ({ client, order }) =>
    sendTelegram([
      `*Payment Verified — MBN DEV*`,
      ``,
      `Client: ${client.name}`,
      `Project: ${order.title}`,
      `Amount: $${Number(order.totalPrice).toLocaleString('en-US')}`,
      ``,
      `Project is now active. Client notified by email.`,
    ].join('\n')),

  projectStatusUpdate: ({ client, project, toStatus }) => {
    const labels = {
      pending:       'Queued',
      active:        'Started',
      'in-progress': 'In Progress',
      review:        'In Review',
      revision:      'Revision',
      completed:     'Completed',
      cancelled:     'Cancelled',
    };
    return sendTelegram([
      `*Project Updated — MBN DEV*`,
      ``,
      `Client: ${client.name}`,
      `Project: ${project.title}`,
      `Status: ${labels[toStatus] || toStatus}`,
      ``,
      `${APP_URL}/dashboard/admin/projects/${project.id}`,
    ].join('\n'));
  },

  newClientMessage: ({ client, project, preview }) =>
    sendTelegram([
      `*New Message — MBN DEV*`,
      ``,
      `From: ${client.name}`,
      project ? `Project: ${project.title}` : '',
      preview ? `"${preview}"` : '',
      ``,
      `${APP_URL}/dashboard/admin/messages`,
    ].filter(Boolean).join('\n')),

};

module.exports = { sendTelegram, wa };
