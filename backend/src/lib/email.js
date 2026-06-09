// ─── Email infrastructure ────────────────────────────────────────────────────
// Uses Brevo Transactional Email HTTP API — works on Vercel (no SMTP blocking).
// Falls back to stdout in dev when BREVO_API_KEY is not configured.
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

const https   = require('https');

const FROM    = process.env.EMAIL_FROM || 'MBN DEV <contact@mbndev.ma>';
const APP_URL = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

// Parse "Name <email>" → { name, email }
function parseSender(from) {
  const m = from.match(/^(.+?)\s*<(.+?)>$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { name: 'MBN DEV', email: from };
}

// ─── Core send ───────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: 'no_recipient' };

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev] → ${to}  ::  ${subject}`);
    return { sent: false, reason: 'no_brevo_key' };
  }

  const sender = parseSender(FROM);
  const body   = JSON.stringify({
    sender,
    to:          [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text || stripHtml(html),
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path:     '/v3/smtp/email',
        method:   'POST',
        headers:  {
          'api-key':        apiKey,
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ sent: true, id: JSON.parse(data)?.messageId });
          } else {
            console.error('[email] Brevo error:', res.statusCode, data.slice(0, 200));
            resolve({ sent: false, reason: `HTTP ${res.statusCode}: ${data.slice(0, 100)}` });
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error('[email] request error:', err.message);
      resolve({ sent: false, reason: err.message });
    });
    req.write(body);
    req.end();
  });
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function stripHtml(html = '') {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function e(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg:          '#09090d',
  card:        '#111118',
  border:      '#1e1e2c',
  borderInner: '#18181f',
  textPrimary: '#f1f5f9',
  textSecond:  '#94a3b8',
  textMuted:   '#64748b',
  textDim:     '#334155',
  purple:      '#7c3aed',
  purpleDark:  '#5b21b6',
  purpleLight: '#a78bfa',
  purpleBg:    '#1a0f2e',
  purpleBorder:'#2d1a5e',
  green:       '#10b981',
  greenBg:     '#071a12',
  greenBorder: '#0d3320',
  amber:       '#f59e0b',
  amberBg:     '#1a1100',
  amberBorder: '#3d2900',
  blue:        '#60a5fa',
  blueBg:      '#0a1628',
  blueBorder:  '#1e3a5f',
  red:         '#f87171',
  redBg:       '#200a0a',
  redBorder:   '#5f1e1e',
  font:        `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`,
  mono:        `'Courier New',Courier,monospace`,
};

// ─── UI Components ───────────────────────────────────────────────────────────

function badge(text, { bg = T.purpleBg, color = T.purpleLight, border = T.purpleBorder } = {}) {
  return `<div style="display:inline-block;background:${bg};color:${color};border:1px solid ${border};font-size:10.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:5px 12px;border-radius:20px;margin-bottom:22px;font-family:${T.font};">${e(text)}</div>`;
}

function statusBadge(status) {
  const map = {
    pending:    { label: 'Pending',     bg: T.amberBg,  color: T.amber,  border: T.amberBorder },
    active:     { label: 'Active',      bg: T.blueBg,   color: T.blue,   border: T.blueBorder  },
    in_review:  { label: 'In Review',   bg: T.purpleBg, color: T.purpleLight, border: T.purpleBorder },
    revision:   { label: 'Revision',    bg: T.amberBg,  color: T.amber,  border: T.amberBorder },
    delivered:  { label: 'Delivered',   bg: T.greenBg,  color: T.green,  border: T.greenBorder },
    completed:  { label: 'Completed',   bg: T.greenBg,  color: T.green,  border: T.greenBorder },
    cancelled:  { label: 'Cancelled',   bg: T.redBg,    color: T.red,    border: T.redBorder   },
  };
  const s = map[status] || { label: status, bg: T.purpleBg, color: T.purpleLight, border: T.purpleBorder };
  return badge(s.label, s);
}

function ctaButton(label, url) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
  <tr>
    <td style="border-radius:12px;" bgcolor="${T.purple}">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${e(url)}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="25%" strokecolor="${T.purpleDark}" fillcolor="${T.purple}"><v:fill type="gradient" color="${T.purple}" color2="${T.purpleDark}" angle="135"/><w:anchorlock/><center style="color:#fff;font-family:${T.font};font-size:15px;font-weight:700;">${e(label)}</center></v:roundrect><![endif]-->
      <!--[if !mso]><!-->
      <a href="${e(url)}" style="background:linear-gradient(135deg,${T.purple},${T.purpleDark});display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;font-family:${T.font};letter-spacing:-0.01em;min-width:160px;text-align:center;">${e(label)}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

function infoBox(rows) {
  const last = rows.length - 1;
  const rowsHtml = rows.map(([label, value, opts = {}], i) => `
<tr>
  <td style="padding:13px 0;${i < last ? `border-bottom:1px solid ${T.borderInner};` : ''}color:${T.textMuted};font-size:13px;font-family:${T.font};white-space:nowrap;padding-right:32px;">${e(label)}</td>
  <td style="padding:13px 0;${i < last ? `border-bottom:1px solid ${T.borderInner};` : ''}color:${opts.color || T.textPrimary};font-size:13px;font-weight:${opts.bold ? '700' : '500'};font-family:${T.font};text-align:right;">${e(String(value))}</td>
</tr>`).join('');
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;background:#0d0d15;border:1px solid ${T.border};border-radius:14px;">
  <tr><td style="padding:2px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
  </td></tr>
</table>`;
}

function steps(items) {
  const itemsHtml = items.map((item, i) => `
<tr>
  <td style="padding:0 16px 20px 0;vertical-align:top;width:36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,${T.purple},${T.purpleDark});text-align:center;vertical-align:middle;color:#fff;font-size:13px;font-weight:700;font-family:${T.font};line-height:32px;">${i + 1}</td></tr>
    </table>
  </td>
  <td style="padding:0 0 20px;vertical-align:top;">
    <div style="font-size:14px;font-weight:600;color:${T.textPrimary};font-family:${T.font};line-height:32px;">${e(item.title)}</div>
    ${item.desc ? `<div style="font-size:13px;color:${T.textMuted};font-family:${T.font};line-height:1.65;margin-top:1px;">${item.desc}</div>` : ''}
  </td>
</tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;">${itemsHtml}</table>`;
}

function notice(text, { type = 'info' } = {}) {
  const map = {
    info:     { bg: T.blueBg,   border: T.blueBorder,   color: T.blue,        icon: 'i' },
    warning:  { bg: T.amberBg,  border: T.amberBorder,  color: T.amber,       icon: '!' },
    success:  { bg: T.greenBg,  border: T.greenBorder,  color: T.green,       icon: '&#10003;' },
    security: { bg: T.purpleBg, border: T.purpleBorder, color: T.purpleLight, icon: '#' },
    danger:   { bg: T.redBg,    border: T.redBorder,    color: T.red,         icon: '!' },
  };
  const c = map[type] || map.info;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
  <tr>
    <td style="background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:14px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;padding-right:12px;width:20px;font-size:14px;line-height:1.4;">${c.icon}</td>
          <td style="font-size:13px;color:${c.color};font-family:${T.font};line-height:1.65;">${text}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function divider(margin = '16px 0') {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};"><tr><td style="height:1px;background:${T.border};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function textBlock(html, { mt = '24', mb = '4' } = {}) {
  return `<p style="margin:${mt}px 0 ${mb}px;font-size:14px;line-height:1.75;color:${T.textSecond};font-family:${T.font};">${html}</p>`;
}

// ─── Layout shell ────────────────────────────────────────────────────────────

function layout({ preheader = '', heading, badgeHtml = '', intro, body = '', footer }) {
  const pre = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${T.bg};">${e(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : '';
  const footerText = footer ||
    'You received this email because you have an account with MBN DEV. If you did not expect this, you can safely ignore it.';

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${e(heading)}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    @media only screen and (max-width:620px) {
      .ep { padding-left:24px !important; padding-right:24px !important; }
      h1  { font-size:24px !important; letter-spacing:-0.03em !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${T.bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${T.bg};">
<tr><td align="center" style="padding:52px 16px 72px;">

  <!-- Outer 600px wrapper -->
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- Top gradient bar -->
    <tr>
      <td height="3" style="background:linear-gradient(90deg,${T.purpleDark} 0%,${T.purple} 35%,#a855f7 65%,${T.purple} 100%);border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td>
    </tr>

    <!-- Card -->
    <tr>
      <td style="background-color:${T.card};border:1px solid ${T.border};border-top:none;border-radius:0 0 22px 22px;">

        <!-- ── Logo header ─────────────────────────────────── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="ep" style="padding:28px 40px 22px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,${T.purple},${T.purpleDark});text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:18px;font-weight:800;font-family:${T.font};display:block;line-height:34px;">M</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#f8fafc;font-size:14px;font-weight:700;font-family:${T.font};letter-spacing:-0.02em;">MBN<span style="color:${T.purpleLight};"> DEV</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- header divider -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="height:1px;background:${T.borderInner};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <!-- ── Hero ───────────────────────────────────────── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="ep" style="padding:40px 40px 0;">
              ${badgeHtml}
              <h1 style="margin:0 0 14px;font-size:28px;line-height:1.22;color:#ffffff;font-weight:700;font-family:${T.font};letter-spacing:-0.04em;">${e(heading)}</h1>
              ${intro ? `<p style="margin:0;font-size:15px;line-height:1.75;color:${T.textSecond};font-family:${T.font};">${intro}</p>` : ''}
            </td>
          </tr>
        </table>

        <!-- ── Body ───────────────────────────────────────── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="ep" style="padding:0 40px 8px;">
              ${body}
            </td>
          </tr>
        </table>

        <!-- ── Footer ─────────────────────────────────────── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="height:1px;background:${T.borderInner};font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td class="ep" style="padding:22px 40px 32px;">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.7;color:${T.textDim};font-family:${T.font};">${footerText}</p>
              <p style="margin:0;font-size:12px;color:#1e293b;font-family:${T.font};">
                &copy; ${new Date().getFullYear()} MBN DEV &nbsp;&middot;&nbsp;
                <a href="${APP_URL}" style="color:#334155;text-decoration:none;">mbndev.ma</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

const STATUS_DESCRIPTIONS = {
  pending:   'Your project is queued and awaiting activation. Payment confirmation is the next step.',
  active:    'Work has started on your project. Expect regular progress updates in your dashboard.',
  in_review: 'A deliverable is ready for your review. Open your project to see it and share feedback.',
  revision:  'Revisions are being worked on based on your feedback. We\'ll notify you when ready.',
  delivered: 'Your project has been delivered. Review everything and mark as complete when satisfied.',
  completed: 'Your project is complete. All source files and assets have been handed over.',
  cancelled: 'This project has been cancelled. Contact us if you\'d like to discuss next steps.',
};

const templates = {

  // ── Welcome ──────────────────────────────────────────────────────────────
  welcome: ({ user }) => {
    const first   = user.name.split(' ')[0];
    const dashUrl = `${APP_URL}/dashboard/${user.role === 'admin' ? 'admin' : 'client'}`;
    return {
      subject: `Welcome to MBN DEV, ${first}`,
      html: layout({
        preheader: `Your account is ready — here's how to get started with your first project.`,
        badgeHtml: badge('Account created', { bg: T.greenBg, color: T.green, border: T.greenBorder }),
        heading:   `Welcome, ${first}.`,
        intro:     `You now have a dedicated workspace to brief, track, and ship software projects — with the person building it just one message away.`,
        body: [
          steps([
            {
              title: 'Request a project',
              desc:  'Tell us what you\'re building — stack, scope, timeline. We review every brief within 24 hours and confirm pricing upfront, in writing.',
            },
            {
              title: 'Track progress in real time',
              desc:  'Every milestone, message, and status change appears instantly in your dashboard. No chasing for updates.',
            },
            {
              title: 'Receive and own your code',
              desc:  'Full source code delivered at completion. No recurring fees, no vendor lock-in — it\'s yours to deploy and iterate on.',
            },
          ]),
          divider('8px 0 24px'),
          textBlock(`Ready to start? <a href="${APP_URL}/request" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">Open the project request form →</a>`),
          ctaButton('Go to my dashboard', dashUrl),
        ].join(''),
        footer: `You're receiving this because you just created an account on MBN DEV. Have a question? Reply directly to this email.`,
      }),
    };
  },

  // ── Password reset ────────────────────────────────────────────────────────
  passwordReset: ({ user, resetUrl }) => ({
    subject: `Reset your MBN DEV password`,
    html: layout({
      preheader: 'Your reset link is inside — valid for 60 minutes, one-time use.',
      badgeHtml: badge('Password reset', { bg: T.amberBg, color: T.amber, border: T.amberBorder }),
      heading:   'Reset your password',
      intro:     'We received a request to reset the password on your MBN DEV account. Use the button below to choose a new one.',
      body: [
        notice('This link expires in <strong style="color:' + T.amber + ';">60 minutes</strong> and works only once. If you need a new one, request another reset.', { type: 'warning' }),
        ctaButton('Reset my password', resetUrl),
        textBlock(`If the button doesn't work, copy and paste this URL directly into your browser:`),
        `<div style="margin:0 0 20px;font-size:12px;color:${T.purpleLight};font-family:${T.mono};word-break:break-all;background:#0d0d15;padding:14px 16px;border-radius:10px;border:1px solid ${T.border};line-height:1.6;">${e(resetUrl)}</div>`,
        notice(`Didn't request this? Your password is still the same — ignore this email and the link will expire automatically. If you're concerned, <a href="${APP_URL}/contact" style="color:${T.purpleLight};text-decoration:none;">contact us</a>.`, { type: 'security' }),
      ].join(''),
      footer: `This request was made for the account registered to ${e(user?.email || 'your email address')}.`,
    }),
  }),

  // ── Order placed ──────────────────────────────────────────────────────────
  orderPlaced: ({ user, order }) => {
    const first = user.name.split(' ')[0];
    return {
      subject: `Order confirmed — ${order.title}`,
      html: layout({
        preheader: `We received your order for "${order.title}". Complete payment to kick things off.`,
        badgeHtml: badge('Order received'),
        heading:   `Your order is confirmed, ${first}.`,
        intro:     `We have everything we need to get started. Complete your payment below and we'll activate your project the same day.`,
        body: [
          infoBox([
            ['Project',  order.title],
            ['Service',  order.serviceType || 'Custom'],
            ['Total',    `$${Number(order.totalPrice).toLocaleString('en-US')}`, { bold: true, color: T.purpleLight }],
            ['Delivery', `${order.deliveryDays} business days`],
          ]),
          divider('4px 0 20px'),
          textBlock('Once your payment is verified, your project goes live and work begins immediately.'),
          ctaButton('Complete payment →', `${APP_URL}/checkout/${order.id}`),
          divider('4px 0 20px'),
          textBlock(`Questions about this order? <a href="${APP_URL}/dashboard/client/messages" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">Message us directly →</a>`, { mt: '0' }),
        ].join(''),
        footer: `This confirmation was sent to ${e(user.email)}. Order details are also available in your dashboard.`,
      }),
    };
  },

  // ── Payment verified ──────────────────────────────────────────────────────
  paymentVerified: ({ client, order, project }) => {
    const first = client.name.split(' ')[0];
    return {
      subject: `Payment verified — your project is live`,
      html: layout({
        preheader: `Payment confirmed. Work on "${order.title}" starts today.`,
        badgeHtml: badge('Payment verified', { bg: T.greenBg, color: T.green, border: T.greenBorder }),
        heading:   `You\'re live, ${first}.`,
        intro:     `Your payment has been verified and your project is now active. We're on it — you'll see the first status update in your dashboard shortly.`,
        body: [
          infoBox([
            ['Project',  order.title],
            ['Amount',   `$${Number(order.totalPrice).toLocaleString('en-US')}`, { bold: true, color: T.green }],
            ['Status',   'Active'],
            ['Delivery', `${order.deliveryDays} business days`],
          ]),
          divider('4px 0 20px'),
          textBlock(`<strong style="color:${T.textPrimary};">What happens next</strong>`),
          steps([
            {
              title: 'We start immediately',
              desc:  'Your project is being scoped and work begins today. You\'ll see real-time status updates as we progress.',
            },
            {
              title: 'Direct messaging throughout',
              desc:  'Have a question or want to adjust scope? Message us directly from your project dashboard — no ticket queues.',
            },
            {
              title: 'Delivery & source handover',
              desc:  'Once delivered and approved, the full source code is yours. No recurring fees, no lock-in.',
            },
          ]),
          ctaButton('Open my project →', `${APP_URL}/dashboard/client/projects/${project.id}`),
        ].join(''),
        footer: `Payment receipt and project details are available in your dashboard at any time.`,
      }),
    };
  },

  // ── Admin: new payment to verify ─────────────────────────────────────────
  adminPaymentSubmitted: ({ order, client, method }) => ({
    subject: `Action required: payment to verify — ${order.title}`,
    html: layout({
      preheader: `${client.name} submitted a $${Number(order.totalPrice).toLocaleString('en-US')} payment via ${method}. Verification needed.`,
      badgeHtml: badge('Action required', { bg: T.amberBg, color: T.amber, border: T.amberBorder }),
      heading:   'New payment to verify',
      intro:     `A client has submitted a manual payment and is waiting for verification. Once approved, their project activates automatically.`,
      body: [
        infoBox([
          ['Client',  client.name],
          ['Email',   client.email],
          ['Project', order.title],
          ['Amount',  `$${Number(order.totalPrice).toLocaleString('en-US')}`, { bold: true, color: T.amber }],
          ['Method',  method],
        ]),
        notice('Verify the payment in your admin panel and approve to automatically activate the project and notify the client.', { type: 'warning' }),
        ctaButton('Verify payment →', `${APP_URL}/dashboard/admin/payments`),
      ].join(''),
      footer: 'This notification was sent to the MBN DEV admin account.',
    }),
  }),

  // ── Invoice email ─────────────────────────────────────────────────────────
  invoiceEmail: ({ client, payment, order, project }) => {
    const first      = client.name.split(' ')[0];
    const year       = new Date(payment.createdAt).getFullYear();
    const invoiceNum = `INV-${year}-${(payment._id || payment.id || '').slice(-6).toUpperCase()}`;
    const isPaid     = payment.status === 'paid';
    const paidDate   = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
    const issueDate  = new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const title      = order?.title || project?.title || 'Web Development Service';
    const METHOD_LABELS = { cih_bank: 'CIH Bank Transfer', paypal: 'PayPal', taptapsend: 'TapTapSend', mock: 'Online Payment' };
    const methodLabel = METHOD_LABELS[payment.method] || 'Manual Payment';
    const amountFmt  = `$${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return {
      subject: isPaid
        ? `Invoice ${invoiceNum} — Paid ${amountFmt}`
        : `Invoice ${invoiceNum} — ${amountFmt} due`,
      html: layout({
        preheader: isPaid
          ? `Your invoice ${invoiceNum} has been paid. Thank you!`
          : `Invoice ${invoiceNum} for ${amountFmt} from MBN DEV.`,
        badgeHtml: isPaid
          ? badge('Payment confirmed', { bg: T.greenBg, color: T.green, border: T.greenBorder })
          : badge(invoiceNum),
        heading: isPaid ? `Invoice paid — thank you, ${first}.` : `Invoice for ${first}`,
        intro: isPaid
          ? `Your payment of ${amountFmt} has been received and confirmed. Your receipt is below.`
          : `Please find your invoice below. Reach out if you have any questions.`,
        body: [
          infoBox([
            ['Invoice',    invoiceNum],
            ['Issue date', issueDate],
            ...(paidDate ? [['Paid on', paidDate, { color: T.green }]] : []),
            ['Description', title],
            ['Method',     methodLabel],
            ['Amount',     amountFmt, { bold: true, color: isPaid ? T.green : T.purpleLight }],
          ]),
          isPaid
            ? notice(`Payment of <strong style="color:${T.green};">${amountFmt}</strong> confirmed. All source code and assets will be delivered upon project completion.`, { type: 'success' })
            : notice(`To complete your payment, visit your client portal and follow the payment instructions. Contact us if you need assistance.`, { type: 'info' }),
          ctaButton(
            isPaid ? 'Open my project →' : 'View my portal →',
            isPaid && project?.id
              ? `${APP_URL}/dashboard/client/projects/${project.id}`
              : `${APP_URL}/dashboard/client/payments`
          ),
          textBlock(`View or print your invoice at any time from your <a href="${APP_URL}/invoice/${payment._id || payment.id}" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">client portal →</a>`, { mt: '0' }),
        ].join(''),
        footer: `This invoice was sent to ${e(client.email)} for services provided by MBN DEV.`,
      }),
    };
  },

  // ── Project status update ─────────────────────────────────────────────────
  projectStatusUpdate: ({ client, project, fromStatus, toStatus }) => {
    const first  = client.name.split(' ')[0];
    const desc   = STATUS_DESCRIPTIONS[toStatus] || `Your project status has been updated to "${toStatus}".`;
    const sLabel = toStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      subject: `Project update: ${project.title} is now ${sLabel}`,
      html: layout({
        preheader: `"${project.title}" moved to ${sLabel}. ${desc}`,
        badgeHtml: statusBadge(toStatus),
        heading:   `${sLabel}: ${project.title}`,
        intro:     desc,
        body: [
          infoBox([
            ['Project',    project.title],
            ['Previous',   fromStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())],
            ['Now',        sLabel, { bold: true }],
          ]),
          toStatus === 'in_review'
            ? notice('A deliverable is ready for your review. Check your project dashboard and share any feedback directly with the team.', { type: 'info' })
            : toStatus === 'delivered'
              ? notice('Your project has been delivered. Review all files and mark as complete when you\'re satisfied.', { type: 'success' })
              : '',
          ctaButton('View project →', `${APP_URL}/dashboard/client/projects/${project.id}`),
          textBlock(`Have questions or feedback? <a href="${APP_URL}/dashboard/client/messages" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">Message the team →</a>`, { mt: '0' }),
        ].join(''),
        footer: `You're receiving project updates for "${e(project.title)}" on MBN DEV.`,
      }),
    };
  },

  // ── Platform update announcement ──────────────────────────────────────────
  platformUpdate: ({ user }) => {
    const first   = (user?.name || 'there').split(' ')[0];
    const dashUrl = `${APP_URL}/dashboard/client`;
    const checkoutUrl = `${APP_URL}/dashboard/client/orders`;
    return {
      subject: `New on MBN DEV — You can now edit orders, pay later, and more`,
      html: layout({
        preheader: `Edit your order before paying, save it for later, and track your payment status in real time.`,
        badgeHtml: badge('Platform Update — May 2026', { bg: T.purpleBg, color: T.purpleLight, border: T.purpleBorder }),
        heading:   `We just shipped 4 new features for you, ${first}.`,
        intro:     `Based on your feedback, we've made the checkout and payment experience much more flexible. Here's everything that's new.`,
        body: [

          divider('28px 0 24px'),

          // ── Feature 1: Edit Order ────────────────────────────────────────────
          `<p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.purpleLight};font-family:${T.font};">Checkout</p>`,
          `<h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#ffffff;font-family:${T.font};letter-spacing:-0.02em;">Edit your order before you pay</h2>`,

          notice(`You can now modify your order description and notes directly on the checkout page — before submitting any payment. Just click <strong style="color:#fff;">Edit Order</strong> in the order summary card.`, { type: 'info' }),

          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 0;">`,
          `<tr>`,
          `<td style="width:48%;vertical-align:top;background:#0d0d15;border:1px solid ${T.border};border-radius:14px;padding:20px 22px;">`,
          `<div style="font-size:22px;margin-bottom:10px;">✏️</div>`,
          `<div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:6px;">Update Requirements</div>`,
          `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">Changed your mind about the details? Edit your order description or add notes right from the checkout page — no need to cancel and restart.</div>`,
          `</td>`,
          `<td style="width:4%;"></td>`,
          `<td style="width:48%;vertical-align:top;background:#0d0d15;border:1px solid ${T.border};border-radius:14px;padding:20px 22px;">`,
          `<div style="font-size:22px;margin-bottom:10px;">💾</div>`,
          `<div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:6px;">Saves Instantly</div>`,
          `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">Changes are saved to your order immediately with updated pricing — so what you pay for is exactly what you asked for.</div>`,
          `</td>`,
          `</tr>`,
          `</table>`,

          divider('32px 0'),

          // ── Feature 2: Pay Later ─────────────────────────────────────────────
          `<p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.green};font-family:${T.font};">Flexibility</p>`,
          `<h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#ffffff;font-family:${T.font};letter-spacing:-0.02em;">Not ready to pay right now? Save it for later.</h2>`,

          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">`,
          ...[
            ['🔖', 'Save Order & Pay Later', 'A new button at the bottom of checkout lets you save your order without paying. Your order stays in your dashboard, ready whenever you are.'],
            ['📋', 'Pick up where you left off', 'Go to My Orders in your dashboard at any time and click the checkout link to complete payment — your order details are all preserved.'],
            ['🔔', 'No pressure', 'Your saved order won\'t expire. Come back in an hour or in a week — it will be waiting for you exactly as you left it.'],
          ].map(([icon, title, desc]) =>
            `<tr><td style="padding:0 0 12px;vertical-align:top;">` +
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0d0d15;border:1px solid ${T.border};border-radius:12px;">` +
            `<tr><td style="padding:16px 18px;">` +
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
            `<td style="font-size:18px;padding-right:14px;vertical-align:top;line-height:1.4;">${icon}</td>` +
            `<td><div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:3px;">${title}</div>` +
            `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">${desc}</div></td>` +
            `</tr></table></td></tr></table></td></tr>`
          ).join(''),
          `</table>`,

          divider('32px 0'),

          // ── Feature 3: Payment waiting state ────────────────────────────────
          `<p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.amber};font-family:${T.font};">Payments</p>`,
          `<h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#ffffff;font-family:${T.font};letter-spacing:-0.02em;">Real-time payment verification status</h2>`,

          notice(`Once you submit your payment proof, the checkout page now shows a clear <strong style="color:#fff;">"Awaiting Confirmation"</strong> status — no more wondering if your payment went through. The page updates automatically once we verify it.`, { type: 'success' }),

          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 0;">`,
          `<tr>`,
          `<td style="width:48%;vertical-align:top;background:#0d0d15;border:1px solid ${T.border};border-radius:14px;padding:20px 22px;">`,
          `<div style="font-size:22px;margin-bottom:10px;">⏳</div>`,
          `<div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:6px;">No Double Submissions</div>`,
          `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">After submitting, the payment button is hidden. You won't accidentally submit the same payment twice.</div>`,
          `</td>`,
          `<td style="width:4%;"></td>`,
          `<td style="width:48%;vertical-align:top;background:#0d0d15;border:1px solid ${T.border};border-radius:14px;padding:20px 22px;">`,
          `<div style="font-size:22px;margin-bottom:10px;">🔁</div>`,
          `<div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:6px;">Retry if Needed</div>`,
          `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">If we don't receive your payment, you'll get a notification and the payment form reappears automatically — ready for a fresh attempt.</div>`,
          `</td>`,
          `</tr>`,
          `</table>`,

          divider('32px 0'),

          // ── CTA ─────────────────────────────────────────────────────────────
          `<div style="background:linear-gradient(135deg,${T.purpleBg},#0e0816);border:1px solid ${T.purpleBorder};border-radius:16px;padding:32px 28px;text-align:center;">`,
          `<div style="font-size:28px;margin-bottom:12px;">🚀</div>`,
          `<h3 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#fff;font-family:${T.font};letter-spacing:-0.02em;">Ready to try it out?</h3>`,
          `<p style="margin:0 0 24px;font-size:14px;color:${T.textSecond};font-family:${T.font};line-height:1.7;">Head to your dashboard to place or manage your orders. The new checkout experience is live right now.</p>`,
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">`,
          `<tr><td style="border-radius:12px;" bgcolor="${T.purple}">`,
          `<!--[if !mso]><!-->`,
          `<a href="${checkoutUrl}" style="background:linear-gradient(135deg,${T.purple},${T.purpleDark});display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;font-family:${T.font};letter-spacing:-0.01em;">View My Orders →</a>`,
          `<!--<![endif]-->`,
          `</td></tr></table>`,
          `</div>`,

          divider('28px 0 4px'),
          textBlock(`Questions or feedback? Reply to this email or <a href="${APP_URL}/dashboard/client/messages" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">message us in the app</a>. We read everything.`, { mt: '20', mb: '20' }),

        ].join(''),
        footer: `You're receiving this because you have an account on MBN DEV. This is a product update — not a promotional email.`,
      }),
    };
  },

  // ── Week 1: "Haven't started yet?" nudge ────────────────────────────────────
  // Send to users who signed up but never placed an order.
  getStarted: ({ user }) => {
    const first      = (user?.name || 'there').split(' ')[0];
    const requestUrl = `${APP_URL}/request`;
    return {
      subject: `${first}, your workspace is ready — let's build something`,
      html: layout({
        preheader: `You signed up for MBN DEV but haven't started a project yet. Here's how to kick things off in 5 minutes.`,
        badgeHtml: badge('Get started', { bg: T.greenBg, color: T.green, border: T.greenBorder }),
        heading:   `Your workspace is set up, ${first}. Let's use it.`,
        intro:     `You created your MBN DEV account — but you haven't launched a project yet. That's totally fine. Here's everything you need to go from zero to a live brief in under 5 minutes.`,
        body: [
          divider('28px 0 24px'),
          steps([
            {
              title: 'Tell us what you want to build',
              desc:  'Fill out the project request form — stack, scope, timeline, budget. It takes about 3 minutes. No commitment yet.',
            },
            {
              title: 'Get a fixed price in writing',
              desc:  'We review every brief within 24 hours and send back a clear quote. No surprises, no hourly billing.',
            },
            {
              title: 'Pay once, track everything',
              desc:  'After payment, your private project workspace opens — with live progress, file sharing, and direct messaging.',
            },
          ]),
          divider('8px 0 24px'),
          notice(`We work on <strong style="color:${T.green};">websites, e-commerce stores, SaaS dashboards, and mobile apps</strong>. If you're not sure what you need, describe the problem and we'll figure it out together.`, { type: 'success' }),
          ctaButton('Start my project request →', requestUrl),
          textBlock(`Or if you have questions first, just <a href="${APP_URL}/dashboard/client/messages" style="color:${T.purpleLight};text-decoration:none;font-weight:500;">send us a message</a> — we reply fast.`, { mt: '4' }),
        ].join(''),
        footer: `You received this because you have an account on MBN DEV and haven't started a project yet.`,
      }),
    };
  },

  // ── Week 1 (active clients): personal check-in ───────────────────────────────
  checkIn: ({ user }) => {
    const first   = (user?.name || 'there').split(' ')[0];
    const dashUrl = `${APP_URL}/dashboard/client`;
    return {
      subject: `Checking in — how's everything going, ${first}?`,
      html: layout({
        preheader: `A quick note from the MBN DEV team. Your feedback matters and we want to hear from you.`,
        badgeHtml: badge('Personal note', { bg: T.blueBg, color: T.blue, border: T.blueBorder }),
        heading:   `Hey ${first} — just checking in.`,
        intro:     `A week or so in, and we want to make sure everything is running smoothly for you. This is a real email, not an automated sequence — we genuinely want to know how your experience has been.`,
        body: [
          divider('28px 0 24px'),
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">`,
          ...[
            ['Is your dashboard doing what you need it to?', 'If anything feels confusing or slow, tell us. We ship fixes fast.'],
            ['Are you getting the project updates you expect?', 'Every status change and milestone posts a message in your project chat automatically.'],
            ['Do you have questions about payment or invoices?', 'All your receipts and invoices are in the Payments section of your dashboard.'],
          ].map(([q, a]) =>
            `<tr><td style="padding:0 0 14px;">` +
            `<div style="background:#0d0d15;border:1px solid ${T.border};border-radius:14px;padding:18px 20px;">` +
            `<div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:5px;">${q}</div>` +
            `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">${a}</div>` +
            `</div></td></tr>`
          ).join(''),
          `</table>`,
          notice(`Reply directly to this email — or <a href="${APP_URL}/dashboard/client/messages" style="color:${T.blue};text-decoration:none;font-weight:500;">open the in-app chat</a>. Either way, a real person reads and responds.`, { type: 'info' }),
          ctaButton('Open my dashboard', dashUrl),
        ].join(''),
        footer: `You received this because you have an active account on MBN DEV.`,
      }),
    };
  },

  // ── Week 2: what we're building next ─────────────────────────────────────────
  comingSoon: ({ user }) => {
    const first   = (user?.name || 'there').split(' ')[0];
    const dashUrl = `${APP_URL}/dashboard/client`;
    return {
      subject: `What's coming next on MBN DEV — June preview`,
      html: layout({
        preheader: `A sneak peek at the features we're building right now. Your feedback shaped these.`,
        badgeHtml: badge('Coming soon', { bg: T.amberBg, color: T.amber, border: T.amberBorder }),
        heading:   `Here's what we're building next, ${first}.`,
        intro:     `Based on feedback from clients like you, here's a preview of what's coming to MBN DEV over the next few weeks.`,
        body: [
          divider('28px 0 24px'),
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">`,
          ...[
            ['🧾', 'Stripe Payments', 'Almost ready', T.green, T.greenBg, T.greenBorder,
              'Pay by card directly in the platform — no bank transfers, no back-and-forth. One click and you\'re live.'],
            ['📊', 'Project Analytics', 'In progress', T.amber, T.amberBg, T.amberBorder,
              'A live progress chart inside your project — see time spent per milestone, completion rate, and delivery forecast.'],
            ['🔔', 'Mobile Push Notifications', 'Planned', T.blue, T.blueBg, T.blueBorder,
              'Get notified on your phone the second your project status changes or a new message arrives.'],
            ['🌍', 'Arabic Interface', 'Planned', T.purpleLight, T.purpleBg, T.purpleBorder,
              'Full Arabic language support across the entire platform — RTL layout included.'],
          ].map(([icon, title, status, color, bg, border, desc]) =>
            `<tr><td style="padding:0 0 12px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d15;border:1px solid ${T.border};border-radius:14px;">` +
            `<tr><td style="padding:18px 20px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
            `<tr>` +
            `<td style="font-size:20px;padding-right:14px;vertical-align:top;width:32px;line-height:1.5;">${icon}</td>` +
            `<td style="vertical-align:top;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
            `<td><div style="font-size:14px;font-weight:600;color:#fff;font-family:${T.font};margin-bottom:5px;">${title}</div></td>` +
            `<td style="text-align:right;"><div style="display:inline-block;background:${bg};color:${color};border:1px solid ${border};font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;font-family:${T.font};">${status}</div></td>` +
            `</tr></table>` +
            `<div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">${desc}</div>` +
            `</td></tr></table></td></tr></table></td></tr>`
          ).join(''),
          `</table>`,
          divider('20px 0 24px'),
          notice(`Want to influence what we build next? <a href="${APP_URL}/dashboard/client/messages" style="color:${T.amber};text-decoration:none;font-weight:500;">Send us your top request</a> — the most-requested features move up the list.`, { type: 'warning' }),
          ctaButton('Go to my dashboard', dashUrl),
        ].join(''),
        footer: `You received this because you have an account on MBN DEV. This is a product roadmap preview — not a guarantee of delivery dates.`,
      }),
    };
  },

  // ── Outreach — cold email to a prospect ──────────────────────────────────────
  outreach: ({ name, type = 'riad', customBody = null }) => {
    const APP_URL_LOCAL = process.env.CLIENT_URL || 'https://mbndev.ma';
    const firstName = name.split(' ')[0];

    const defaultBody = `
${textBlock(`My name is <strong style="color:${T.textPrimary};">Mounir</strong>, a professional web developer based in Morocco. I came across <strong style="color:${T.textPrimary};">${name}</strong> and wanted to reach out directly.`)}
${divider('16px 0')}
${textBlock(`Here is what I can do for you:`)}
${infoBox([
  ['Website Audit',     'I review your current online presence and identify exactly what is hurting your bookings'],
  ['Fix Issues',        'I correct technical problems, broken pages, slow load times, and poor mobile experience'],
  ['Redesign',          'I rebuild your existing site with a modern, conversion-focused design'],
  ['New Website',       'I design and develop a full professional website from scratch — tailored to your property'],
])}
${divider('16px 0')}
${infoBox([
  ['Delivery',          '14 days from project start'],
  ['Starting price',    '$799 — all-inclusive'],
  ['You own the code',  'Full source code delivered to you'],
  ['Revisions',         'Included until you are satisfied'],
])}
${notice(`No hidden fees. No lock-in. After delivery, the website is yours — you are free to host it anywhere. I offer a <strong style="color:${T.green};">free 15-minute consultation</strong> to review your current situation and answer any questions.`, { type: 'success' })}
${ctaButton('View my portfolio', APP_URL_LOCAL + '/portfolio')}
${textBlock(`Or simply reply to this email — I read everything and respond within 24 hours.`)}`;

    return {
      subject: `Professional website for ${name} — free audit included`,
      html: layout({
        preheader: `Professional web development for Moroccan riads — site audit, fixes, redesign, or new build. Free consultation included.`,
        badgeHtml: badge('MBN DEV — Web Development', { bg: T.purpleBg, color: T.purpleLight, border: T.purpleBorder }),
        heading:   `Hello ${firstName},`,
        body:      customBody || defaultBody,
        footer:    `You are receiving this email because your business matches our services. To unsubscribe, reply with "Unsubscribe". — Mounir Banni, MBN DEV, contact@mbndev.ma`,
      }),
    };
  },

  // ── Week 2: limited-time offer ────────────────────────────────────────────────
  specialOffer: ({ user }) => {
    const first      = (user?.name || 'there').split(' ')[0];
    const requestUrl = `${APP_URL}/request`;
    const expiry     = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return {
      subject: `${first} — exclusive offer inside (expires ${expiry})`,
      html: layout({
        preheader: `A limited offer for MBN DEV clients. Valid for one week only.`,
        badgeHtml: badge('Limited offer', { bg: T.amberBg, color: T.amber, border: T.amberBorder }),
        heading:   `A special offer, just for you.`,
        intro:     `As one of our early clients, we want to give you something back. For the next 7 days, we're offering an exclusive deal on new projects.`,
        body: [
          divider('28px 0 24px'),

          // Offer card
          `<div style="background:linear-gradient(135deg,${T.purpleBg},#0e0816);border:1px solid ${T.purpleBorder};border-radius:18px;padding:32px 28px;text-align:center;margin:0 0 24px;">`,
          `<div style="font-size:36px;margin-bottom:12px;">🎁</div>`,
          `<div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${T.purpleLight};font-family:${T.font};margin-bottom:10px;">Exclusive client offer</div>`,
          `<div style="font-size:32px;font-weight:800;color:#fff;font-family:${T.font};letter-spacing:-0.04em;margin-bottom:8px;">10% off your next project</div>`,
          `<div style="font-size:14px;color:${T.textSecond};font-family:${T.font};line-height:1.7;margin-bottom:20px;">Start a new project request before <strong style="color:${T.amber};">${expiry}</strong> and get 10% off the total price — applied automatically.</div>`,
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">`,
          `<tr><td style="border-radius:12px;" bgcolor="${T.purple}">`,
          `<!--[if !mso]><!-->`,
          `<a href="${requestUrl}" style="background:linear-gradient(135deg,${T.purple},${T.purpleDark});display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;font-family:${T.font};letter-spacing:-0.01em;">Claim my 10% discount →</a>`,
          `<!--<![endif]-->`,
          `</td></tr></table>`,
          `</div>`,

          infoBox([
            ['Discount',     '10% off total project price'],
            ['Applies to',   'All project types'],
            ['Valid until',  expiry,             { color: T.amber, bold: true }],
            ['How to use',   'Start a request — we apply it manually before invoicing'],
          ]),

          notice(`This offer is exclusive to existing MBN DEV clients and cannot be combined with other promotions. To claim, simply start a new project request before the expiry date and mention this email.`, { type: 'info' }),
        ].join(''),
        footer: `You received this exclusive offer because you have an account on MBN DEV. Offer valid until ${expiry}.`,
      }),
    };
  },

};

// ─── Broadcast helper ─────────────────────────────────────────────────────────

/**
 * Send an email to a list of recipients, with a small delay between each send
 * to avoid triggering rate-limits on the Brevo free tier (300/day, 9/min).
 * Returns a summary: { sent, failed, skipped }
 */
async function sendBroadcast(recipients, templateFn, delayMs = 350) {
  let sent = 0, failed = 0, skipped = 0;
  for (const user of recipients) {
    if (!user.email) { skipped++; continue; }
    try {
      const tpl = templateFn(user);
      const result = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
      if (result.sent) sent++; else failed++;
    } catch {
      failed++;
    }
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
  return { sent, failed, skipped };
}

module.exports = { sendEmail, sendBroadcast, templates };
