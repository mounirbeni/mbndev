const { adminOpenaiKey } = require('../lib/adminKeys');
const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const { searchPlaces, PlacesError } = require('../lib/leadsAi/places');
const { searchOsm, OsmError } = require('../lib/leadsAi/osm');
const { auditWebsite } = require('../lib/leadsAi/audit');
const { scoreAudit } = require('../lib/leadsAi/score');
const { generateMessage, LANGS } = require('../lib/leadsAi/message');

// Monthly searches per plan (null = unlimited).
const PLAN_LIMITS = { starter: 50, pro: null, agency: null };
const PLANS = Object.keys(PLAN_LIMITS);
const STATUSES = ['new', 'contacted', 'replied', 'won', 'lost'];

const monthKey = () => new Date().toISOString().slice(0, 7);

/** Loads the buyer's account (admins always get one) or answers 403. */
exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.leadsAiAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') {
      account = await prisma.leadsAiAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    }
    if (!account) {
      return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Leads AI is not active on this account.' });
    }
    req.leadsAccount = account;
    next();
  } catch (err) { next(err); }
};

function publicAccount(a, adminKey = null) {
  const used = a.searchMonth === monthKey() ? a.searchCount : 0;
  const limit = PLAN_LIMITS[a.plan] ?? null;
  return {
    plan: a.plan,
    searches: { used, limit, remaining: limit === null ? null : Math.max(0, limit - used) },
    hasGoogleKey: Boolean(a.googleKeyEnc),
    hasOpenaiKey: Boolean(a.openaiKeyEnc || adminKey),
  };
}

// GET /api/leads-ai/me
exports.me = async (req, res) => {
  res.json({ success: true, account: publicAccount(req.leadsAccount, await adminOpenaiKey(req.user)), languages: Object.keys(LANGS) });
};

// PUT /api/leads-ai/keys — { googleKey?, openaiKey? }; '' clears a key
exports.saveKeys = async (req, res, next) => {
  try {
    const { googleKey, openaiKey } = req.body || {};
    const data = {};
    for (const [field, value, pattern] of [
      ['googleKeyEnc', googleKey, /^[A-Za-z0-9_-]{20,80}$/],
      ['openaiKeyEnc', openaiKey, /^sk-[A-Za-z0-9_-]{20,200}$/],
    ]) {
      if (value === undefined) continue;
      const v = String(value).trim();
      if (v === '') { data[field] = null; continue; }
      if (!pattern.test(v)) {
        return res.status(400).json({ success: false, message: `That ${field.startsWith('google') ? 'Google' : 'OpenAI'} key doesn't look valid.` });
      }
      data[field] = encrypt(v);
    }
    const account = await prisma.leadsAiAccount.update({ where: { id: req.leadsAccount.id }, data });
    res.json({ success: true, account: publicAccount(account) });
  } catch (err) { next(err); }
};

// POST /api/leads-ai/search — { query, max? }
exports.search = async (req, res, next) => {
  try {
    const query = String(req.body?.query || '').trim().slice(0, 200);
    const max = Math.min(60, Math.max(1, Number(req.body?.max) || 60));
    if (query.length < 3) return res.status(400).json({ success: false, message: 'Describe the businesses you are looking for, e.g. "dentists in London".' });

    const account = req.leadsAccount;
    // With a Google Places key: Google (ratings, reviews, best coverage).
    // Without one: free OpenStreetMap search, so Leads AI works at no cost.
    const apiKey = decrypt(account.googleKeyEnc);
    const source = apiKey ? 'google' : 'osm';

    const usage = publicAccount(account).searches;
    if (usage.limit !== null && usage.remaining <= 0) {
      return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `You've used all ${usage.limit} searches this month. Upgrade to Pro for unlimited searches.` });
    }

    let places;
    try {
      places = source === 'google' ? await searchPlaces({ query, apiKey, max }) : await searchOsm({ query, max });
    } catch (err) {
      if (err instanceof PlacesError) return res.status(err.status).json({ success: false, message: `Google: ${err.message}` });
      if (err instanceof OsmError) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }

    const month = monthKey();
    const updated = await prisma.leadsAiAccount.update({
      where: { id: account.id },
      data: account.searchMonth === month ? { searchCount: { increment: 1 } } : { searchMonth: month, searchCount: 1 },
    });

    const saved = await prisma.prospect.findMany({
      where: { userId: req.user.id, placeId: { in: places.map((p) => p.placeId) } },
      select: { placeId: true },
    });
    const savedIds = new Set(saved.map((s) => s.placeId));
    res.json({
      success: true,
      query,
      source,
      results: places.map((p) => ({ ...p, saved: savedIds.has(p.placeId) })),
      account: publicAccount(updated),
    });
  } catch (err) { next(err); }
};

// POST /api/leads-ai/analyze — { items: [{ id, website }] } (max 5 per call)
exports.analyze = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 5) : [];
    if (!items.length) return res.status(400).json({ success: false, message: 'Nothing to analyze.' });
    const results = await Promise.all(items.map(async (it) => {
      const audit = await auditWebsite(it.website || null);
      return { id: String(it.id || ''), audit, ...scoreAudit(audit) };
    }));
    res.json({ success: true, results });
  } catch (err) { next(err); }
};

// POST /api/leads-ai/message — { business, audit, lang?, tone?, senderName?, service? }
exports.message = async (req, res, next) => {
  try {
    const { business, audit, lang = 'en', tone = 'friendly', senderName = '', service = '' } = req.body || {};
    if (!business?.name) return res.status(400).json({ success: false, message: 'Missing business.' });
    const { issues } = scoreAudit(audit);
    const out = await generateMessage({
      apiKey:     decrypt(req.leadsAccount.openaiKeyEnc) || await adminOpenaiKey(req.user),
      business:   { name: String(business.name).slice(0, 120), address: business.address, rating: business.rating, reviews: business.reviews, website: business.website },
      audit,
      issues,
      lang:       LANGS[lang] ? lang : 'en',
      tone:       ['friendly', 'professional', 'direct'].includes(tone) ? tone : 'friendly',
      senderName: String(senderName).slice(0, 80),
      service:    String(service).slice(0, 160) || undefined,
    });
    res.json({ success: true, ...out });
  } catch (err) { next(err); }
};

// ─── Saved prospects (the buyer's mini-CRM) ──────────────────────────────────

const pick = (b) => ({
  name:    String(b.name || '').slice(0, 160),
  address: b.address ? String(b.address).slice(0, 300) : null,
  phone:   b.phone ? String(b.phone).slice(0, 40) : null,
  website: b.website ? String(b.website).slice(0, 300) : null,
  email:   b.email ? String(b.email).slice(0, 160) : null,
  rating:  typeof b.rating === 'number' ? b.rating : null,
  reviews: Number.isInteger(b.reviews) ? b.reviews : null,
  mapsUrl: b.mapsUrl ? String(b.mapsUrl).slice(0, 400) : null,
  query:   b.query ? String(b.query).slice(0, 200) : null,
});

// GET /api/leads-ai/prospects?status=
exports.listProspects = async (req, res, next) => {
  try {
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
    const prospects = await prisma.prospect.findMany({
      where: { userId: req.user.id, ...(status ? { status } : {}) },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: 1000,
    });
    res.json({ success: true, prospects: prospects.map((p) => ({ ...p, issues: scoreAudit(p.audit).issues })) });
  } catch (err) { next(err); }
};

// POST /api/leads-ai/prospects — save (or refresh) one business
exports.saveProspect = async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.placeId || !b.name) return res.status(400).json({ success: false, message: 'Missing business.' });
    const { score } = scoreAudit(b.audit);
    const data = { ...pick(b), score, audit: b.audit ?? undefined, message: b.message ? String(b.message).slice(0, 4000) : undefined };
    if (!data.email && Array.isArray(b.audit?.emails) && b.audit.emails[0]) data.email = String(b.audit.emails[0]).slice(0, 160);
    const prospect = await prisma.prospect.upsert({
      where:  { userId_placeId: { userId: req.user.id, placeId: String(b.placeId).slice(0, 200) } },
      create: { userId: req.user.id, placeId: String(b.placeId).slice(0, 200), ...data },
      update: data,
    });
    res.status(201).json({ success: true, prospect });
  } catch (err) { next(err); }
};

// PUT /api/leads-ai/prospects/:id — { status?, notes?, message?, email? }
exports.updateProspect = async (req, res, next) => {
  try {
    const { status, notes, message, email } = req.body || {};
    if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const { count } = await prisma.prospect.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes: String(notes).slice(0, 4000) } : {}),
        ...(message !== undefined ? { message: String(message).slice(0, 4000) } : {}),
        ...(email !== undefined ? { email: String(email).slice(0, 160) || null } : {}),
      },
    });
    if (!count) return res.status(404).json({ success: false, message: 'Lead not found.' });
    const prospect = await prisma.prospect.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, prospect });
  } catch (err) { next(err); }
};

// DELETE /api/leads-ai/prospects/:id
exports.deleteProspect = async (req, res, next) => {
  try {
    const { count } = await prisma.prospect.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Lead not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /api/leads-ai/prospects/export — CSV of all saved leads
exports.exportProspects = async (req, res, next) => {
  try {
    const rows = await prisma.prospect.findMany({ where: { userId: req.user.id }, orderBy: { score: 'desc' } });
    // Leading =,+,-,@ would run as a formula in Excel/Sheets.
    const cell = (v) => {
      let s = v == null ? '' : String(v);
      if (/^[=+\-@]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const head = ['Name', 'Score', 'Status', 'Email', 'Phone', 'Website', 'Address', 'Rating', 'Reviews', 'Issues', 'Message', 'Notes', 'Google Maps'];
    const lines = rows.map((p) => [
      p.name, p.score, p.status, p.email, p.phone, p.website, p.address, p.rating, p.reviews,
      scoreAudit(p.audit).issues.map((i) => i.label).join('; '), p.message, p.notes, p.mapsUrl,
    ].map(cell).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mbn-leads.csv"');
    res.send(`\uFEFF${[head.map(cell).join(','), ...lines].join('\r\n')}`);
  } catch (err) { next(err); }
};

// GET /api/leads-ai/admin/accounts — who has which plan — admin
exports.adminListAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.leadsAiAccount.findMany({ select: { userId: true, plan: true } });
    res.json({ success: true, accounts });
  } catch (err) { next(err); }
};

// PUT /api/leads-ai/admin/access — { userId | email, plan } (plan null revokes) — admin
exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const where = req.body?.userId
      ? { id: String(req.body.userId) }
      : { email: String(req.body?.email || '').trim().toLowerCase() };
    const user = await prisma.user.findUnique({ where, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.leadsAiAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.leadsAiAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    const account = await prisma.leadsAiAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Leads AI: you're now on ${label}` : 'MBN Leads AI is active on your account',
        message: existing
          ? `Your MBN Leads AI plan is now ${label}.`
          : `Your ${label} plan is active. Open MBN Leads AI, add your Google key in Settings and run your first search.`,
        link:    '/leads-ai',
      }, { email: true });
    }
    res.json({ success: true, access: true, account: publicAccount(account) });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
