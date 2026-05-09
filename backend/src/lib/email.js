// ─── Email infrastructure ───────────────────────────────────────────────────
// Uses Resend if RESEND_API_KEY is configured. Otherwise logs to console
// (dev-friendly fallback — never throws, never blocks user flows).
//
// All transactional templates live in templates.* below to keep email
// content version-controlled with the rest of the app.

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (err) {
  console.error('[email] resend init failed:', err.message);
}

const FROM = process.env.EMAIL_FROM || 'MBN DEV <onboarding@resend.dev>';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Send a transactional email. Always async, never throws.
 * Returns { sent: boolean, id?: string, reason?: string }.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: 'no_recipient' };

  if (!resend) {
    // Dev-mode no-op: log enough to verify the call site without spamming
    console.log(`[email:dev] → ${to}  ::  ${subject}`);
    return { sent: false, reason: 'no_provider_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });
    if (error) {
      console.error('[email] send failed:', error);
      return { sent: false, reason: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('[email] send threw:', err.message);
    return { sent: false, reason: err.message };
  }
}

function stripHtml(html = '') {
  return String(html).replace(/<style[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
}

// ─── Layout ─────────────────────────────────────────────────────────────────
// Single shared shell so every email looks like the same product.

function layout({ heading, intro, ctaLabel, ctaUrl, body, footer }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#0a0a0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0d;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#7c3aed;width:36px;height:36px;border-radius:10px;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:18px;">M</td>
            <td style="padding-left:12px;font-size:15px;font-weight:600;color:#fff;letter-spacing:-0.01em;">MBN DEV</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;">
          <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#fff;font-weight:700;">${escapeHtml(heading)}</h1>
          ${intro ? `<p style="margin:0 0 16px 0;color:#94a3b8;font-size:15px;line-height:1.6;">${intro}</p>` : ''}
        </td></tr>
        ${body ? `<tr><td style="padding:8px 32px;">${body}</td></tr>` : ''}
        ${ctaUrl ? `<tr><td style="padding:24px 32px 8px 32px;">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:12px;">${escapeHtml(ctaLabel || 'Open MBN DEV')}</a>
        </td></tr>` : ''}
        <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);margin-top:24px;">
          <p style="margin:24px 0 0 0;color:#64748b;font-size:12px;line-height:1.6;">${footer || `Sent by MBN DEV. If you did not expect this email, you can safely ignore it.`}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function infoBox(rows) {
  const lines = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">${escapeHtml(k)}</td>
        <td style="padding:6px 0;color:#e2e8f0;font-size:13px;text-align:right;font-weight:500;">${escapeHtml(v)}</td></tr>`
  ).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:8px 16px;margin:4px 0;">${lines}</table>`;
}

// ─── Templates ──────────────────────────────────────────────────────────────

const templates = {
  welcome: ({ user }) => ({
    subject: `Welcome to MBN DEV, ${user.name.split(' ')[0]}`,
    html: layout({
      heading: `Welcome aboard, ${escapeHtml(user.name.split(' ')[0])}.`,
      intro:   `Your MBN DEV account is ready. From your dashboard you can request a project, track progress in real time, and message us directly.`,
      ctaLabel: 'Open my dashboard',
      ctaUrl:   `${APP_URL}/dashboard/${user.role === 'admin' ? 'admin' : 'client'}`,
      body:     `<p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7;">Need to start a project right away? <a href="${APP_URL}/request" style="color:#a78bfa;text-decoration:none;">Send us your project brief</a> — we usually respond within 24 hours.</p>`,
    }),
  }),

  passwordReset: ({ user, resetUrl }) => ({
    subject: `Reset your MBN DEV password`,
    html: layout({
      heading:  'Reset your password',
      intro:    `We received a request to reset the password for your MBN DEV account. The link below is valid for 60 minutes.`,
      ctaLabel: 'Reset my password',
      ctaUrl:   resetUrl,
      body:     `<p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">If the button doesn't work, paste this link into your browser:<br/><a href="${resetUrl}" style="color:#a78bfa;word-break:break-all;">${resetUrl}</a></p>`,
      footer:   `If you didn't request a password reset, ignore this email — your password stays the same.`,
    }),
  }),

  orderPlaced: ({ user, order }) => ({
    subject: `Order received: ${order.title}`,
    html: layout({
      heading: `We received your order`,
      intro:   `Thanks ${escapeHtml(user.name.split(' ')[0])} — your order is in. Once payment clears, we'll activate the project and you'll be able to track everything in your dashboard.`,
      body:    infoBox([
        ['Project', order.title],
        ['Total',   `$${Number(order.totalPrice).toLocaleString()}`],
        ['Delivery', `${order.deliveryDays} business days`],
      ]),
      ctaLabel: 'Complete payment',
      ctaUrl:   `${APP_URL}/checkout/${order.id}`,
    }),
  }),

  paymentVerified: ({ client, order, project }) => ({
    subject: `Payment verified — your project is live`,
    html: layout({
      heading: `Payment verified ✓`,
      intro:   `Your payment for "${escapeHtml(order.title)}" has been verified and your project is now active. We'll start work right away.`,
      body:    infoBox([
        ['Project', order.title],
        ['Amount',  `$${Number(order.totalPrice).toLocaleString()}`],
        ['Status',  'Active'],
      ]),
      ctaLabel: 'Open my project',
      ctaUrl:   `${APP_URL}/dashboard/client/projects/${project.id}`,
    }),
  }),

  adminPaymentSubmitted: ({ order, client, method }) => ({
    subject: `New payment to verify: ${order.title}`,
    html: layout({
      heading: `Manual payment to verify`,
      intro:   `${escapeHtml(client.name)} submitted a payment of $${Number(order.totalPrice).toLocaleString()} via ${escapeHtml(method)} for "${escapeHtml(order.title)}".`,
      ctaLabel: 'Verify in admin',
      ctaUrl:   `${APP_URL}/dashboard/admin/payments`,
    }),
  }),

  projectStatusUpdate: ({ client, project, fromStatus, toStatus }) => ({
    subject: `Project update: ${project.title}`,
    html: layout({
      heading: `Status update: ${escapeHtml(toStatus)}`,
      intro:   `Your project "${escapeHtml(project.title)}" moved from <strong>${escapeHtml(fromStatus)}</strong> to <strong>${escapeHtml(toStatus)}</strong>.`,
      ctaLabel: 'Open project',
      ctaUrl:   `${APP_URL}/dashboard/client/projects/${project.id}`,
    }),
  }),
};

module.exports = { sendEmail, templates };
