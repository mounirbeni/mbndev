const crypto = require('crypto');
const { adminOpenaiKey } = require('../lib/adminKeys');
const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const { generateProposal } = require('../lib/proposalAi/generate');
const { normalizeContent, normalizeItems, totalOf, CURRENCIES, LANGUAGES } = require('../lib/proposalAi/shape');

// AI-written proposals per month (null = unlimited); Agency removes branding and adds templates.
const PLAN_LIMITS = {
  starter: { proposals: 10, branding: true, templates: false },
  pro:     { proposals: null, branding: true, templates: false },
  agency:  { proposals: null, branding: false, templates: true },
};
const PLANS = Object.keys(PLAN_LIMITS);
const FOLLOW_UP_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
const monthKey = () => new Date().toISOString().slice(0, 7);
const limitsOf = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
const newToken = () => crypto.randomBytes(16).toString('hex');
const money = (n, currency) => `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;

/** The buyer's OpenAI key; falls back to the ones saved in the other MBN products. */
async function openaiKeyFor(account) {
  const own = decrypt(account.openaiKeyEnc);
  if (own) return own;
  const where = { where: { userId: account.userId }, select: { openaiKeyEnc: true } };
  const rows = await Promise.all([
    prisma.leadsAiAccount.findUnique(where),
    prisma.localGrowthAccount.findUnique(where),
    prisma.supportAiAccount.findUnique(where),
    prisma.reviewBoosterAccount.findUnique(where),
  ]);
  for (const r of rows) { const k = decrypt(r?.openaiKeyEnc); if (k) return k; }
  return adminOpenaiKey(account.userId);
}

async function publicAccount(a) {
  const lim = limitsOf(a.plan);
  const used = a.proposalMonth === monthKey() ? a.proposalCount : 0;
  return {
    plan: a.plan,
    proposals: { used, limit: lim.proposals },
    templates: lim.templates,
    hasOpenaiKey: Boolean(await openaiKeyFor(a)),
    brandName: a.brandName || '', brandColor: a.brandColor, brandEmail: a.brandEmail || '', brandWebsite: a.brandWebsite || '',
    currency: a.currency,
  };
}

exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.proposalAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') {
      account = await prisma.proposalAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    }
    if (!account) return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Proposal AI is not active on this account.' });
    req.prAccount = account;
    next();
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try { res.json({ success: true, account: await publicAccount(req.prAccount) }); } catch (err) { next(err); }
};

// PUT /api/proposal-ai/settings — { openaiKey?, brandName?, brandColor?, brandEmail?, brandWebsite?, currency? }
exports.saveSettings = async (req, res, next) => {
  try {
    const b = req.body || {};
    const data = {};
    if (b.openaiKey !== undefined) {
      const v = String(b.openaiKey).trim();
      if (v && !/^sk-[A-Za-z0-9_-]{20,200}$/.test(v)) return res.status(400).json({ success: false, message: "That OpenAI key doesn't look valid." });
      data.openaiKeyEnc = v ? encrypt(v) : null;
    }
    if (b.brandName !== undefined) data.brandName = String(b.brandName).trim().slice(0, 80) || null;
    if (b.brandColor !== undefined) {
      if (!/^#[0-9a-f]{6}$/i.test(b.brandColor)) return res.status(400).json({ success: false, message: 'Colour must look like #7c3aed.' });
      data.brandColor = b.brandColor;
    }
    if (b.brandEmail !== undefined) {
      const e = String(b.brandEmail).trim().slice(0, 160);
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ success: false, message: 'Invalid email.' });
      data.brandEmail = e || null;
    }
    if (b.brandWebsite !== undefined) {
      const url = String(b.brandWebsite).trim().slice(0, 200);
      if (url && !/^https?:\/\/[^\s]+$/i.test(url)) return res.status(400).json({ success: false, message: 'Website must start with http:// or https://' });
      data.brandWebsite = url || null;
    }
    if (b.currency !== undefined) {
      if (!CURRENCIES.includes(b.currency)) return res.status(400).json({ success: false, message: `Currency must be one of ${CURRENCIES.join(', ')}.` });
      data.currency = b.currency;
    }
    const account = await prisma.proposalAccount.update({ where: { id: req.prAccount.id }, data });
    res.json({ success: true, account: await publicAccount(account) });
  } catch (err) { next(err); }
};

// ─── Proposals ───────────────────────────────────────────────────────────────

const LIST_FIELDS = {
  id: true, title: true, clientName: true, clientCompany: true, status: true, isTemplate: true, currency: true,
  items: true, viewCount: true, sentAt: true, acceptedAt: true, acceptedTotal: true, updatedAt: true, createdAt: true,
};

async function ownProposal(req, res) {
  const p = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!p) res.status(404).json({ success: false, message: 'Proposal not found.' });
  return p;
}

exports.listProposals = async (req, res, next) => {
  try {
    const rows = await prisma.proposal.findMany({ where: { userId: req.user.id }, orderBy: { updatedAt: 'desc' }, take: 300, select: LIST_FIELDS });
    res.json({ success: true, proposals: rows.map(({ items, ...p }) => ({ ...p, total: totalOf(Array.isArray(items) ? items : []) })) });
  } catch (err) { next(err); }
};

// POST /api/proposal-ai/proposals — { clientName, clientCompany?, clientEmail?, clientPhone?, brief?, language?, currency?, templateId?, blank? }
exports.createProposal = async (req, res, next) => {
  try {
    const b = req.body || {};
    const account = req.prAccount;
    const clientName = String(b.clientName || '').trim().slice(0, 100);
    if (!clientName) return res.status(400).json({ success: false, message: 'Who is the proposal for? Add the client name.' });
    const language = LANGUAGES.includes(b.language) ? b.language : 'en';
    const currency = CURRENCIES.includes(b.currency) ? b.currency : account.currency;
    const client = {
      clientName,
      clientCompany: String(b.clientCompany || '').trim().slice(0, 120) || null,
      clientEmail: String(b.clientEmail || '').trim().slice(0, 160) || null,
      clientPhone: String(b.clientPhone || '').replace(/[^\d+\s()-]/g, '').trim().slice(0, 30) || null,
    };

    let draft;
    if (b.templateId) {
      const tpl = await prisma.proposal.findFirst({ where: { id: String(b.templateId), userId: req.user.id, isTemplate: true } });
      if (!tpl) return res.status(404).json({ success: false, message: 'Template not found.' });
      draft = { title: tpl.title, content: normalizeContent(tpl.content), items: normalizeItems(tpl.items), language: tpl.language, currency: tpl.currency };
    } else if (b.blank) {
      draft = { title: `Proposal for ${client.clientCompany || clientName}`, content: normalizeContent({}), items: [], language, currency };
    } else {
      const brief = String(b.brief || '').trim().slice(0, 4000);
      if (brief.length < 20) return res.status(400).json({ success: false, message: 'Describe what the client needs in a few sentences (at least 20 characters).' });
      const lim = limitsOf(account.plan);
      const used = account.proposalMonth === monthKey() ? account.proposalCount : 0;
      if (lim.proposals !== null && used >= lim.proposals) {
        return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `You've used your ${lim.proposals} AI proposals this month. Upgrade to Pro for unlimited proposals.` });
      }
      const apiKey = await openaiKeyFor(account);
      if (!apiKey) return res.status(400).json({ success: false, code: 'NO_OPENAI_KEY', message: 'Add your OpenAI API key in Settings first.' });
      try {
        draft = { ...(await generateProposal({ apiKey, brief, ...client, brandName: account.brandName, language, currency })), language, currency };
      } catch (err) {
        return res.status(502).json({ success: false, message: `AI: ${err.message}`.slice(0, 220) });
      }
      const month = monthKey();
      await prisma.proposalAccount.update({
        where: { id: account.id },
        data: account.proposalMonth === month ? { proposalCount: { increment: 1 } } : { proposalMonth: month, proposalCount: 1 },
      });
    }

    const proposal = await prisma.proposal.create({
      data: {
        userId: req.user.id, ...client, title: draft.title.slice(0, 140), language: draft.language, currency: draft.currency,
        content: draft.content, items: draft.items, shareToken: newToken(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json({ success: true, proposal });
  } catch (err) { next(err); }
};

exports.getProposal = async (req, res, next) => {
  try {
    const p = await ownProposal(req, res);
    if (p) res.json({ success: true, proposal: p });
  } catch (err) { next(err); }
};

// PUT /api/proposal-ai/proposals/:id — editable fields; accepted proposals are locked.
exports.updateProposal = async (req, res, next) => {
  try {
    const p = await ownProposal(req, res);
    if (!p) return;
    if (p.status === 'accepted') return res.status(409).json({ success: false, message: 'This proposal was accepted and can no longer be edited. Duplicate it to make a new version.' });
    const b = req.body || {};
    const data = {};
    for (const [field, max] of [['title', 140], ['clientName', 100], ['clientCompany', 120], ['clientEmail', 160], ['clientPhone', 30]]) {
      if (b[field] !== undefined) data[field] = String(b[field]).trim().slice(0, max) || (field === 'title' || field === 'clientName' ? p[field] : null);
    }
    if (b.language !== undefined && LANGUAGES.includes(b.language)) data.language = b.language;
    if (b.currency !== undefined && CURRENCIES.includes(b.currency)) data.currency = b.currency;
    if (b.content !== undefined) data.content = normalizeContent(b.content);
    if (b.items !== undefined) data.items = normalizeItems(b.items);
    if (b.validUntil !== undefined) {
      const d = b.validUntil ? new Date(b.validUntil) : null;
      if (d && Number.isNaN(d.getTime())) return res.status(400).json({ success: false, message: 'Invalid date.' });
      data.validUntil = d;
    }
    if (b.isTemplate !== undefined) {
      if (b.isTemplate && !limitsOf(req.prAccount.plan).templates) return res.status(403).json({ success: false, message: 'Templates are part of the Agency plan.' });
      data.isTemplate = Boolean(b.isTemplate);
    }
    res.json({ success: true, proposal: await prisma.proposal.update({ where: { id: p.id }, data }) });
  } catch (err) { next(err); }
};

exports.duplicateProposal = async (req, res, next) => {
  try {
    const p = await ownProposal(req, res);
    if (!p) return;
    const copy = await prisma.proposal.create({
      data: {
        userId: req.user.id, title: `${p.title} (copy)`.slice(0, 140), clientName: p.clientName, clientCompany: p.clientCompany,
        clientEmail: p.clientEmail, clientPhone: p.clientPhone, language: p.language, currency: p.currency,
        content: p.content, items: p.items, shareToken: newToken(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json({ success: true, proposal: copy });
  } catch (err) { next(err); }
};

exports.deleteProposal = async (req, res, next) => {
  try {
    const { count } = await prisma.proposal.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Proposal not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/proposal-ai/proposals/:id/sent — the owner shared the link.
exports.markSent = async (req, res, next) => {
  try {
    const p = await ownProposal(req, res);
    if (!p) return;
    const data = { sentAt: p.sentAt || new Date() };
    if (p.status === 'draft') data.status = 'sent';
    res.json({ success: true, proposal: await prisma.proposal.update({ where: { id: p.id }, data }) });
  } catch (err) { next(err); }
};

// ─── Public proposal page (no sign-in) ───────────────────────────────────────

async function liveProposal(token) {
  if (!/^[a-f0-9]{32}$/.test(String(token))) return null;
  const p = await prisma.proposal.findUnique({ where: { shareToken: token } });
  if (!p || p.isTemplate) return null;
  const account = await prisma.proposalAccount.findUnique({ where: { userId: p.userId } });
  return account ? { p, account } : null;
}

const expired = (p) => p.validUntil && p.validUntil.getTime() < Date.now() && p.status !== 'accepted';

exports.publicProposal = async (req, res, next) => {
  try {
    const live = await liveProposal(req.params.token);
    if (!live) return res.status(404).json({ success: false, message: 'This proposal is not available.' });
    const { p, account } = live;
    res.json({
      success: true,
      proposal: {
        title: p.title, clientName: p.clientName, clientCompany: p.clientCompany, language: p.language, currency: p.currency,
        content: p.content, items: p.items, status: p.status, validUntil: p.validUntil, createdAt: p.createdAt, expired: Boolean(expired(p)),
        acceptedAt: p.acceptedAt, acceptedName: p.acceptedName, acceptedItems: p.acceptedItems, acceptedTotal: p.acceptedTotal,
      },
      brand: {
        name: account.brandName || null, color: account.brandColor, email: account.brandEmail || null,
        website: account.brandWebsite || null, branding: limitsOf(account.plan).branding,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/proposal-ai/public/:token/view — counted by the page (not for the owner's preview).
exports.publicView = async (req, res, next) => {
  try {
    const live = await liveProposal(req.params.token);
    if (!live) return res.status(404).json({ success: false, message: 'This proposal is not available.' });
    const { p } = live;
    const now = new Date();
    const first = !p.firstViewedAt;
    await prisma.proposal.update({
      where: { id: p.id },
      data: {
        viewCount: { increment: 1 }, lastViewedAt: now,
        ...(first ? { firstViewedAt: now } : {}),
        ...(['draft', 'sent'].includes(p.status) ? { status: 'viewed' } : {}),
      },
    });
    if (first) {
      await notifyClient(p.userId, {
        type:    'status_update',
        title:   `${p.clientName} opened your proposal`,
        message: `"${p.title}" was just opened. A good moment to follow up.`,
        link:    `/proposal-ai/proposals/${p.id}`,
        metadata: { proposalId: p.id },
      });
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/proposal-ai/public/:token/accept — { name, selectedItemIds[] }
exports.publicAccept = async (req, res, next) => {
  try {
    const live = await liveProposal(req.params.token);
    if (!live) return res.status(404).json({ success: false, message: 'This proposal is not available.' });
    const { p } = live;
    if (p.status === 'accepted') return res.status(409).json({ success: false, message: 'This proposal has already been accepted.' });
    if (expired(p)) return res.status(410).json({ success: false, message: 'This proposal has expired. Please ask for an updated one.' });
    const name = String(req.body?.name || '').trim().slice(0, 120);
    if (name.length < 2) return res.status(400).json({ success: false, message: 'Type your full name to accept.' });

    const items = normalizeItems(p.items);
    const wanted = new Set((Array.isArray(req.body?.selectedItemIds) ? req.body.selectedItemIds : []).map(String));
    const selected = items.filter((it) => !it.optional || wanted.has(it.id)).map((it) => it.id);
    const total = totalOf(items, selected);

    const updated = await prisma.proposal.update({
      where: { id: p.id },
      data: { status: 'accepted', acceptedAt: new Date(), acceptedName: name, acceptedItems: selected, acceptedTotal: total, declinedAt: null, declineReason: null },
    });
    await notifyClient(p.userId, {
      type:    'status_update',
      title:   `🎉 ${p.clientName} accepted your proposal`,
      message: `"${p.title}" was accepted by ${name} — total ${money(total, p.currency)}.`,
      link:    `/proposal-ai/proposals/${p.id}`,
      metadata: { proposalId: p.id },
    }, { email: true });
    res.json({ success: true, acceptedAt: updated.acceptedAt, acceptedTotal: total });
  } catch (err) { next(err); }
};

// POST /api/proposal-ai/public/:token/decline — { reason? }
exports.publicDecline = async (req, res, next) => {
  try {
    const live = await liveProposal(req.params.token);
    if (!live) return res.status(404).json({ success: false, message: 'This proposal is not available.' });
    const { p } = live;
    if (p.status === 'accepted') return res.status(409).json({ success: false, message: 'This proposal has already been accepted.' });
    const reason = String(req.body?.reason || '').trim().slice(0, 1000) || null;
    await prisma.proposal.update({ where: { id: p.id }, data: { status: 'declined', declinedAt: new Date(), declineReason: reason } });
    await notifyClient(p.userId, {
      type:    'status_update',
      title:   `${p.clientName} declined your proposal`,
      message: reason ? `"${p.title}" — their reason: "${reason.slice(0, 200)}"` : `"${p.title}" was declined.`,
      link:    `/proposal-ai/proposals/${p.id}`,
      metadata: { proposalId: p.id },
    }, { email: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /api/proposal-ai/cron/follow-ups — daily Vercel Cron run (CRON_SECRET).
// Reminds owners about proposals sent 3+ days ago that got no answer.
exports.cronFollowUps = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'Cron is not configured.' });
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  try {
    const due = await prisma.proposal.findMany({
      where: { status: { in: ['sent', 'viewed'] }, isTemplate: false, followUpSentAt: null, sentAt: { lte: new Date(Date.now() - FOLLOW_UP_AFTER_MS) } },
      take: 200,
    });
    let sent = 0;
    for (const p of due) {
      if (p.validUntil && p.validUntil.getTime() < Date.now()) continue;
      await notifyClient(p.userId, {
        type:    'status_update',
        title:   `Follow up with ${p.clientName}?`,
        message: p.viewCount
          ? `They opened "${p.title}" ${p.viewCount} time${p.viewCount === 1 ? '' : 's'} but haven't answered yet — a short message now often closes the deal.`
          : `"${p.title}" hasn't been opened yet — check they received the link.`,
        link:    `/proposal-ai/proposals/${p.id}`,
        metadata: { proposalId: p.id },
      }, { email: true });
      await prisma.proposal.update({ where: { id: p.id }, data: { followUpSentAt: new Date() } });
      sent++;
    }
    res.json({ success: true, sent });
  } catch (err) {
    console.error('[proposal-ai cron] failed:', err.message);
    res.status(500).json({ success: false });
  }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.adminListAccounts = async (req, res, next) => {
  try {
    res.json({ success: true, accounts: await prisma.proposalAccount.findMany({ select: { userId: true, plan: true } }) });
  } catch (err) { next(err); }
};

exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const user = await prisma.user.findUnique({ where: { id: String(req.body?.userId || '') }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.proposalAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.proposalAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    await prisma.proposalAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Proposal AI: you're now on ${label}` : 'MBN Proposal AI is active on your account',
        message: existing ? `Your MBN Proposal AI plan is now ${label}.` : `Your ${label} plan is active. Open MBN Proposal AI and write your first proposal.`,
        link:    '/proposal-ai',
      }, { email: true });
    }
    res.json({ success: true, access: true });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
