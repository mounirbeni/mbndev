// ─── Broadcast campaigns ─────────────────────────────────────────────────────
// Every email the admin can send to all users from Dashboard → Broadcast.
//
//   kind 'monthly'   — tied to one calendar month. Sendable only during that
//                      month (Africa/Casablanca time); before it, it's
//                      "upcoming" (preview + test only); after it, it's
//                      "archived" (preview only — never sent again).
//   kind 'evergreen' — always sendable (onboarding nudges, offers).
//   kind 'retired'   — old campaigns kept for reference; always archived.
//
// The server enforces this (routes/admin.js) — the UI only mirrors it.

const { templates, ui } = require('./email');

const { T, e, APP_URL, layout, badge, ctaButton, iconBadge, notice, divider, textBlock } = ui;

const TZ = 'Africa/Casablanca';

/** 'YYYY-MM' of `date` in Morocco time. */
function monthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}`;
}

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// ── Shared pieces ────────────────────────────────────────────────────────────

const firstName = (user) => e((user?.name || 'there').trim().split(/\s+/)[0] || 'there');
const dashboardUrl = (user) => `${APP_URL}/dashboard/${user?.role === 'admin' ? 'admin' : 'client'}`;
const FOOTER = 'You received this update because you have an account on MBN DEV. To stop receiving updates like this, reply with “unsubscribe”.';

function sectionLabel(text, color = T.purpleLight) {
  return `<p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${color};font-family:${T.font};">${e(text)}</p>`;
}

function sectionTitle(text) {
  return `<h2 style="margin:0 0 14px;font-size:19px;font-weight:700;color:#ffffff;font-family:${T.font};letter-spacing:-0.02em;line-height:1.3;">${e(text)}</h2>`;
}

/** Stacked feature cards: [glyph, title, description, optional link]. */
function featureCards(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px;">${items.map(([glyph, title, desc, href]) => `
<tr><td style="padding:0 0 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d15;border:1px solid ${T.border};border-radius:14px;">
    <tr><td style="padding:16px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:40px;padding-right:14px;vertical-align:top;">${iconBadge(glyph, { size: 36, fontSize: 14 })}</td>
        <td style="vertical-align:top;">
          <div style="font-size:14px;font-weight:600;color:#ffffff;font-family:${T.font};margin-bottom:3px;">${e(title)}</div>
          <div style="font-size:13px;color:${T.textSecond};font-family:${T.font};line-height:1.65;">${e(desc)}</div>
          ${href ? `<a href="${e(href)}" style="display:inline-block;margin-top:8px;font-size:13px;font-weight:600;color:${T.purpleLight};text-decoration:none;font-family:${T.font};">Learn more &rarr;</a>` : ''}
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>`).join('')}</table>`;
}

// ── Monthly campaigns ────────────────────────────────────────────────────────

function october2026(user) {
  const first = firstName(user);
  const dash = dashboardUrl(user);
  return {
    subject: `${(user?.name || 'there').trim().split(/\s+/)[0]}, MBN DEV now works like an app on your phone`,
    preheader: 'Install it on your Home Screen, get notified the moment something changes, and share files up to 500 MB.',
    html: layout({
      preheader: 'Install it on your Home Screen, get notified the moment something changes, and share files up to 500 MB.',
      badgeHtml: badge('October 2026 — What’s new'),
      heading: 'Your projects, now in your pocket.',
      intro: `Hi ${first}, this month we focused on one thing: making MBN DEV feel like a real app on your phone. Here’s what changed in your account.`,
      body: [
        divider('28px 0 24px'),
        sectionLabel('On your phone'),
        sectionTitle('Install MBN DEV in two taps'),
        featureCards([
          ['1', 'Add it to your Home Screen', 'Open mbndev.ma on your phone, tap Share (iPhone) or the menu (Android), then “Add to Home Screen”. It opens full-screen, like an app.'],
          ['2', 'Turn on notifications', 'Tap the bell in your dashboard and allow notifications. You’ll hear from us the moment there’s a project update, a new message or a payment confirmation.'],
        ]),
        notice('On iPhone, notifications only work once MBN DEV is installed on your Home Screen — that’s an Apple rule, not a setting you missed.', { type: 'info' }),
        divider('28px 0 24px'),
        sectionLabel('Also new', T.green),
        sectionTitle('A smoother dashboard on every screen'),
        featureCards([
          ['↑', 'Share big files', 'Send ZIP, RAR and 7z archives, videos, Office documents and images of up to 500 MB, with a live progress bar.'],
          ['✓', 'Cleaner on mobile', 'Lists, payments and invoices now read as simple cards on small screens — no more sideways scrolling.'],
          ['$', 'Clear pricing in USD', 'Every price, invoice and payment amount is shown in US dollars, so what you see is exactly what you pay.'],
        ]),
        ctaButton('Open my dashboard', dash),
        textBlock('Questions or ideas? Just reply to this email — it comes straight to me.', { mt: '8' }),
      ].join(''),
      footer: FOOTER,
    }),
  };
}

function november2026(user) {
  const first = firstName(user);
  const products = `${APP_URL}/products`;
  return {
    subject: `${(user?.name || 'there').trim().split(/\s+/)[0]}, six new tools to grow your business`,
    preheader: 'Digital QR menus, an AI website assistant, Google review automation and more — from $37.',
    html: layout({
      preheader: 'Digital QR menus, an AI website assistant, Google review automation and more — from $37.',
      badgeHtml: badge('November 2026 — MBN Products', { bg: T.greenBg, color: T.green, border: T.greenBorder }),
      heading: 'Beyond websites: tools that bring you customers.',
      intro: `Hi ${first}, besides building websites, MBN DEV now makes ready-to-use software for businesses like yours. Each one works on its own, in your browser — no installation.`,
      body: [
        divider('28px 0 24px'),
        sectionLabel('For restaurants & cafés'),
        sectionTitle('MBN Menu — a digital QR menu'),
        featureCards([
          ['M', 'Your menu in 7 languages', 'Guests scan the table QR code, read the menu in their language, filter out the 14 allergens, order from the table, call the waiter or book a table. You see every order live.', `${APP_URL}/products/menu`],
        ]),
        divider('24px 0 24px'),
        sectionLabel('For every business', T.blue),
        sectionTitle('Five more tools, ready today'),
        featureCards([
          ['S', 'MBN Support AI', 'An AI assistant that answers your website visitors 24/7 — and turns them into leads.', `${APP_URL}/products/support-ai`],
          ['R', 'MBN Review Booster', 'More Google reviews, an alert for every new one, and replies written in seconds.', `${APP_URL}/products/review-booster`],
          ['P', 'MBN Proposal AI', 'Professional proposals your clients can open, customise and sign online.', `${APP_URL}/products/proposal-ai`],
          ['L', 'MBN Leads AI', 'Find businesses that need your service — and know exactly what to say to them.', `${APP_URL}/products/leads-ai`],
          ['G', 'MBN Local Growth', 'See how a local business compares to its competitors online, and what to fix first.', `${APP_URL}/products/local-growth`],
        ]),
        notice('Every product starts from $37. Not sure which one fits? Reply to this email with one line about your business and I’ll tell you honestly.', { type: 'success' }),
        ctaButton('See all products', products),
      ].join(''),
      footer: FOOTER,
    }),
  };
}

function december2026(user) {
  const first = firstName(user);
  const dash = dashboardUrl(user);
  const request = `${APP_URL}/request`;
  return {
    subject: `Thank you, ${(user?.name || 'there').trim().split(/\s+/)[0]} — and a head start on 2027`,
    preheader: 'A quick look back at 2026, and how to have your next project ready for the new year.',
    html: layout({
      preheader: 'A quick look back at 2026, and how to have your next project ready for the new year.',
      badgeHtml: badge('December 2026 — Year in review', { bg: T.amberBg, color: T.amber, border: T.amberBorder }),
      heading: 'Thank you for building with us this year.',
      intro: `Hi ${first}, as 2026 comes to an end I wanted to say thank you. Every project, message and piece of feedback shaped what MBN DEV became this year.`,
      body: [
        divider('28px 0 24px'),
        sectionLabel('2026 on MBN DEV'),
        sectionTitle('What we built for you this year'),
        featureCards([
          ['1', 'A live project tracker', 'Follow every project stage by stage, from kickoff to delivery, with messages and files in one place.'],
          ['2', 'Faster, clearer payments', 'Edit an order before paying, save it for later, and see your payment status live — with invoices in US dollars.'],
          ['3', 'An app on your phone', 'Install MBN DEV on your Home Screen and get notified the moment something changes.'],
          ['4', 'Software for businesses', 'Digital QR menus, an AI website assistant, review automation and AI proposals — from $37.'],
        ]),
        divider('28px 0 24px'),
        sectionLabel('Looking ahead', T.green),
        sectionTitle('Start 2027 with your project ready'),
        textBlock('Planning a new website, a redesign or an online shop for the new year? Send the request now and we’ll prepare the scope and the quote, so work can start as soon as you’re ready.', { mt: '0' }),
        ctaButton('Plan my 2027 project', request),
        textBlock(`Or <a href="${e(dash)}" style="color:${T.purpleLight};text-decoration:none;font-weight:600;">open your dashboard</a> to check on an ongoing project. Happy holidays — see you in 2027.`, { mt: '8' }),
      ].join(''),
      footer: FOOTER,
    }),
  };
}

// ── Registry ─────────────────────────────────────────────────────────────────

const preheaderOf = (html) => (html.match(/<div style="display:none;[^"]*">([^<]*?)&nbsp;/) || [])[1] || '';
const legacy = (fn) => (user) => {
  const out = fn({ user });
  return { ...out, preheader: preheaderOf(out.html) };
};

const CAMPAIGNS = [
  { key: 'october2026',  kind: 'monthly',   month: '2026-10', label: 'October 2026 — MBN DEV on your phone', description: 'Install the app, phone notifications, 500 MB file sharing and the cleaner mobile dashboard.', build: october2026 },
  { key: 'november2026', kind: 'monthly',   month: '2026-11', label: 'November 2026 — MBN Products', description: 'Introduces MBN Menu and the five other MBN products, each from $37.', build: november2026 },
  { key: 'december2026', kind: 'monthly',   month: '2026-12', label: 'December 2026 — Year in review', description: 'Thank-you note, what we built in 2026, and an invitation to plan a 2027 project.', build: december2026 },
  { key: 'getStarted',   kind: 'evergreen', label: 'Get started nudge', description: 'For new accounts that haven’t started a project yet.', build: legacy(templates.getStarted) },
  { key: 'checkIn',      kind: 'evergreen', label: 'Personal check-in', description: 'A short, personal message asking how things are going.', build: legacy(templates.checkIn) },
  { key: 'specialOffer', kind: 'evergreen', label: '10% thank-you offer', description: 'A 7-day 10% reduction on the next project for existing clients.', build: legacy(templates.specialOffer) },
  { key: 'juneUpdate',     kind: 'retired', month: '2026-06', label: 'June 2026 — Platform update', description: 'Old monthly update.', build: legacy(templates.juneUpdate) },
  { key: 'platformUpdate', kind: 'retired', month: '2026-05', label: 'May 2026 — Platform update (v3.6.0)', description: 'Old monthly update.', build: legacy(templates.platformUpdate) },
  { key: 'comingSoon',     kind: 'retired', label: 'What’s coming next (old roadmap)', description: 'Outdated roadmap — mentions features that changed since.', build: legacy(templates.comingSoon) },
];

/** 'live' | 'upcoming' | 'archived' for a campaign at time `now`. */
function campaignStatus(c, now = new Date()) {
  if (c.kind === 'retired') return 'archived';
  if (c.kind === 'evergreen') return 'live';
  const current = monthKey(now);
  if (c.month === current) return 'live';
  return c.month > current ? 'upcoming' : 'archived';
}

function getCampaign(key) {
  return CAMPAIGNS.find((c) => c.key === key) || null;
}

/** Metadata for the admin UI (subject rendered for `user`). */
function listCampaigns(user, now = new Date()) {
  return CAMPAIGNS.map((c) => {
    const { subject, preheader } = c.build(user);
    return {
      key: c.key,
      kind: c.kind,
      month: c.month || null,
      monthLabel: c.month ? monthLabel(c.month) : null,
      label: c.label,
      description: c.description,
      status: campaignStatus(c, now),
      subject,
      preheader,
    };
  });
}

module.exports = { CAMPAIGNS, campaignStatus, getCampaign, listCampaigns, monthKey };
