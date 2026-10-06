const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const { searchPlaces, PlacesError } = require('../lib/leadsAi/places');
const { auditWebsite } = require('../lib/leadsAi/audit');
const { fetchPlace, findCompetitors, buildReport } = require('../lib/localGrowth/report');
const { generateSummary, LANG_NAMES } = require('../lib/localGrowth/summary');

// Reports per month by plan (null = unlimited).
const PLAN_LIMITS = { starter: 20, pro: null, agency: null };
const PLANS = Object.keys(PLAN_LIMITS);
const monthKey = () => new Date().toISOString().slice(0, 7);
const KEY_PATTERNS = { googleKeyEnc: /^[A-Za-z0-9_-]{20,80}$/, openaiKeyEnc: /^sk-[A-Za-z0-9_-]{20,200}$/ };

/** The buyer's keys; falls back to the ones saved in MBN Leads AI. */
async function getKeys(account) {
  let google = decrypt(account.googleKeyEnc);
  let openai = decrypt(account.openaiKeyEnc);
  if (!google || !openai) {
    const leads = await prisma.leadsAiAccount.findUnique({ where: { userId: account.userId }, select: { googleKeyEnc: true, openaiKeyEnc: true } });
    google = google || decrypt(leads?.googleKeyEnc);
    openai = openai || decrypt(leads?.openaiKeyEnc);
  }
  return { google, openai };
}

async function publicAccount(a) {
  const used = a.reportMonth === monthKey() ? a.reportCount : 0;
  const limit = PLAN_LIMITS[a.plan] ?? null;
  const keys = await getKeys(a);
  return {
    plan: a.plan,
    reports: { used, limit, remaining: limit === null ? null : Math.max(0, limit - used) },
    hasGoogleKey: Boolean(keys.google),
    hasOpenaiKey: Boolean(keys.openai),
    brandName: a.brandName || '',
    brandUrl: a.brandUrl || '',
  };
}

exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.localGrowthAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') {
      account = await prisma.localGrowthAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    }
    if (!account) return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Local Growth is not active on this account.' });
    req.lgAccount = account;
    next();
  } catch (err) { next(err); }
};

// GET /api/local-growth/me
exports.me = async (req, res, next) => {
  try {
    res.json({ success: true, account: await publicAccount(req.lgAccount), languages: Object.keys(LANG_NAMES) });
  } catch (err) { next(err); }
};

// PUT /api/local-growth/settings — { googleKey?, openaiKey?, brandName?, brandUrl? }
exports.saveSettings = async (req, res, next) => {
  try {
    const b = req.body || {};
    const data = {};
    for (const [field, value] of [['googleKeyEnc', b.googleKey], ['openaiKeyEnc', b.openaiKey]]) {
      if (value === undefined) continue;
      const v = String(value).trim();
      if (v === '') { data[field] = null; continue; }
      if (!KEY_PATTERNS[field].test(v)) return res.status(400).json({ success: false, message: `That ${field.startsWith('google') ? 'Google' : 'OpenAI'} key doesn't look valid.` });
      data[field] = encrypt(v);
    }
    if (b.brandName !== undefined) data.brandName = String(b.brandName).trim().slice(0, 80) || null;
    if (b.brandUrl !== undefined) {
      const url = String(b.brandUrl).trim().slice(0, 200);
      if (url && !/^https?:\/\/[^\s]+$/i.test(url)) return res.status(400).json({ success: false, message: 'Website must start with http:// or https://' });
      data.brandUrl = url || null;
    }
    const account = await prisma.localGrowthAccount.update({ where: { id: req.lgAccount.id }, data });
    res.json({ success: true, account: await publicAccount(account) });
  } catch (err) { next(err); }
};

// POST /api/local-growth/search — { query } → up to 5 matching businesses
exports.search = async (req, res, next) => {
  try {
    const query = String(req.body?.query || '').trim().slice(0, 200);
    if (query.length < 3) return res.status(400).json({ success: false, message: 'Type the business name and city, e.g. "Riad Yasmine Marrakech".' });
    const { google } = await getKeys(req.lgAccount);
    if (!google) return res.status(400).json({ success: false, code: 'NO_GOOGLE_KEY', message: 'Add your Google Places API key in Settings first.' });
    try {
      const results = await searchPlaces({ query, apiKey: google, max: 5 });
      res.json({ success: true, results });
    } catch (err) {
      if (err instanceof PlacesError) return res.status(err.status).json({ success: false, message: `Google: ${err.message}` });
      throw err;
    }
  } catch (err) { next(err); }
};

const reportOut = (r) => ({ id: r.id, placeId: r.placeId, name: r.name, address: r.address, score: r.score, shareToken: r.shareToken, createdAt: r.createdAt, data: r.data });

// POST /api/local-growth/reports — { placeId, lang? }
exports.createReport = async (req, res, next) => {
  try {
    const placeId = String(req.body?.placeId || '').trim();
    const lang = LANG_NAMES[req.body?.lang] ? req.body.lang : 'en';
    if (!placeId || placeId.length > 300) return res.status(400).json({ success: false, message: 'Pick a business first.' });

    const account = req.lgAccount;
    const pub = await publicAccount(account);
    if (pub.reports.limit !== null && pub.reports.remaining <= 0) {
      return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `You've used all ${pub.reports.limit} reports this month. Upgrade to Pro for unlimited reports.` });
    }
    const { google, openai } = await getKeys(account);
    if (!google) return res.status(400).json({ success: false, code: 'NO_GOOGLE_KEY', message: 'Add your Google Places API key in Settings first.' });

    let place;
    try {
      place = await fetchPlace(placeId, google);
    } catch (err) {
      if (err instanceof PlacesError) return res.status(err.status).json({ success: false, message: `Google: ${err.message}` });
      throw err;
    }
    const [competitors, audit] = await Promise.all([
      findCompetitors(place, google).catch(() => []),
      auditWebsite(place.website),
    ]);
    const data = buildReport({ place, competitors, audit });
    if (openai) {
      try { data.summary = await generateSummary({ apiKey: openai, report: data, lang }); } catch { /* optional */ }
    }

    const month = monthKey();
    const [report] = await prisma.$transaction([
      prisma.localGrowthReport.create({
        data: {
          userId: req.user.id, placeId: place.placeId, name: place.name.slice(0, 160),
          address: place.address ? place.address.slice(0, 300) : null,
          score: data.scores.overall, data, shareToken: crypto.randomBytes(16).toString('hex'),
        },
      }),
      prisma.localGrowthAccount.update({
        where: { id: account.id },
        data: account.reportMonth === month ? { reportCount: { increment: 1 } } : { reportMonth: month, reportCount: 1 },
      }),
    ]);
    res.status(201).json({ success: true, report: reportOut(report) });
  } catch (err) { next(err); }
};

// GET /api/local-growth/reports
exports.listReports = async (req, res, next) => {
  try {
    const reports = await prisma.localGrowthReport.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, placeId: true, name: true, address: true, score: true, shareToken: true, createdAt: true },
    });
    res.json({ success: true, reports });
  } catch (err) { next(err); }
};

// GET /api/local-growth/reports/:id
exports.getReport = async (req, res, next) => {
  try {
    const report = await prisma.localGrowthReport.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, report: reportOut(report), brand: brandOf(req.lgAccount) });
  } catch (err) { next(err); }
};

// DELETE /api/local-growth/reports/:id
exports.deleteReport = async (req, res, next) => {
  try {
    const { count } = await prisma.localGrowthReport.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Agency plan reports carry the buyer's own brand.
const brandOf = (a) => (a && a.plan === 'agency' && a.brandName ? { name: a.brandName, url: a.brandUrl || null } : null);

// GET /api/local-growth/public/:token — shared report, no sign-in
exports.publicReport = async (req, res, next) => {
  try {
    const token = String(req.params.token || '');
    if (!/^[a-f0-9]{32}$/.test(token)) return res.status(404).json({ success: false, message: 'Report not found.' });
    const report = await prisma.localGrowthReport.findUnique({ where: { shareToken: token } });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    const account = await prisma.localGrowthAccount.findUnique({ where: { userId: report.userId }, select: { plan: true, brandName: true, brandUrl: true } });
    res.set('X-Robots-Tag', 'noindex');
    res.json({ success: true, report: { name: report.name, address: report.address, score: report.score, createdAt: report.createdAt, data: report.data }, brand: brandOf(account) });
  } catch (err) { next(err); }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.adminListAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.localGrowthAccount.findMany({ select: { userId: true, plan: true } });
    res.json({ success: true, accounts });
  } catch (err) { next(err); }
};

// PUT /api/local-growth/admin/access — { userId, plan|null }
exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const user = await prisma.user.findUnique({ where: { id: String(req.body?.userId || '') }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.localGrowthAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.localGrowthAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    await prisma.localGrowthAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Local Growth: you're now on ${label}` : 'MBN Local Growth is active on your account',
        message: existing ? `Your MBN Local Growth plan is now ${label}.` : `Your ${label} plan is active. Open MBN Local Growth and create your first report.`,
        link:    '/local-growth',
      }, { email: true });
    }
    res.json({ success: true, access: true });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
