// ─── Email infrastructure ────────────────────────────────────────────────────
// Uses Resend when RESEND_API_KEY is present; falls back to stdout in dev.
// Never throws — all call-sites use fire-and-forget .catch(() => {}).

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (err) {
  console.error('[email] resend init failed:', err.message);
}

const FROM    = process.env.EMAIL_FROM || 'MBN DEV <onboarding@resend.dev>';
const APP_URL = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

// ─── Core send ───────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: 'no_recipient' };
  if (!resend) {
    console.log(`[email:dev] → ${to}  ::  ${subject}`);
    return { sent: false, reason: 'no_provider_configured' };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM, to, subject, html,
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
    info:     { bg: T.blueBg,   border: T.blueBorder,   color: T.blue,        icon: 'ℹ' },
    warning:  { bg: T.amberBg,  border: T.amberBorder,  color: T.amber,       icon: '⚠' },
    success:  { bg: T.greenBg,  border: T.greenBorder,  color: T.green,       icon: '✓' },
    security: { bg: T.purpleBg, border: T.purpleBorder, color: T.purpleLight, icon: '🔒' },
    danger:   { bg: T.redBg,    border: T.redBorder,    color: T.red,         icon: '⚠' },
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
                <a href="${APP_URL}" style="color:#334155;text-decoration:none;">mbndev.vercel.app</a>
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

};

module.exports = { sendEmail, templates };