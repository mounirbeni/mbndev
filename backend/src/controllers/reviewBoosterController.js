const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { normalizeReviewUrl } = require('../lib/reviewBooster/link');

const PLAN_LIMITS = {
  starter: { businesses: 1, branding: true },
  pro:     { businesses: 5, branding: true },
  agency:  { businesses: 25, branding: false },
};
const PLANS = Object.keys(PLAN_LIMITS);
const LANGUAGES = ['en', 'fr', 'ar', 'es'];
const limitsOf = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

async function publicAccount(a) {
  const businesses = await prisma.reviewBusiness.count({ where: { userId: a.userId } });
  return { plan: a.plan, businesses: { used: businesses, limit: limitsOf(a.plan).businesses } };
}

exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.reviewBoosterAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') {
      account = await prisma.reviewBoosterAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    }
    if (!account) return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Review Booster is not active on this account.' });
    req.rbAccount = account;
    next();
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try { res.json({ success: true, account: await publicAccount(req.rbAccount) }); } catch (err) { next(err); }
};

// ─── Businesses ──────────────────────────────────────────────────────────────

async function ownBusiness(req, res) {
  const business = await prisma.reviewBusiness.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!business) res.status(404).json({ success: false, message: 'Business not found.' });
  return business;
}

exports.listBusinesses = async (req, res, next) => {
  try {
    const businesses = await prisma.reviewBusiness.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { feedback: true } } },
    });
    res.json({ success: true, businesses });
  } catch (err) { next(err); }
};

// POST /api/review-booster/businesses — { name, googleReviewUrl, language? }
exports.createBusiness = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const googleReviewUrl = normalizeReviewUrl(req.body?.googleReviewUrl);
    if (!name) return res.status(400).json({ success: false, message: 'Give the business a name.' });
    if (!googleReviewUrl) return res.status(400).json({ success: false, message: 'Paste the Google review link or the Place ID of the business.' });
    const language = LANGUAGES.includes(req.body?.language) ? req.body.language : 'en';

    const pub = await publicAccount(req.rbAccount);
    if (pub.businesses.used >= pub.businesses.limit) {
      return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `Your plan includes ${pub.businesses.limit} business${pub.businesses.limit === 1 ? '' : 'es'}. Upgrade for more.` });
    }
    const business = await prisma.reviewBusiness.create({ data: { userId: req.user.id, name, googleReviewUrl, language } });
    res.status(201).json({ success: true, business });
  } catch (err) { next(err); }
};

exports.getBusiness = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const feedback = await prisma.reviewFeedback.count({ where: { businessId: business.id } });
    res.json({ success: true, business: { ...business, _count: { feedback } } });
  } catch (err) { next(err); }
};

// PUT /api/review-booster/businesses/:id
exports.updateBusiness = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const b = req.body || {};
    const data = {};
    if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 80) || business.name;
    if (b.googleReviewUrl !== undefined) {
      const url = normalizeReviewUrl(b.googleReviewUrl);
      if (!url) return res.status(400).json({ success: false, message: 'Paste the Google review link or the Place ID of the business.' });
      data.googleReviewUrl = url;
    }
    if (b.color !== undefined) {
      if (!/^#[0-9a-f]{6}$/i.test(b.color)) return res.status(400).json({ success: false, message: 'Colour must look like #7c3aed.' });
      data.color = b.color;
    }
    if (b.language !== undefined) {
      if (!LANGUAGES.includes(b.language)) return res.status(400).json({ success: false, message: `Language must be one of ${LANGUAGES.join(', ')}.` });
      data.language = b.language;
    }
    if (b.active !== undefined) data.active = Boolean(b.active);
    res.json({ success: true, business: await prisma.reviewBusiness.update({ where: { id: business.id }, data }) });
  } catch (err) { next(err); }
};

exports.deleteBusiness = async (req, res, next) => {
  try {
    const { count } = await prisma.reviewBusiness.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Business not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/review-booster/businesses/:id/sent — the owner sent a review request.
exports.markSent = async (req, res, next) => {
  try {
    const { count } = await prisma.reviewBusiness.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { requestsSent: { increment: 1 } } });
    if (!count) return res.status(404).json({ success: false, message: 'Business not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.listFeedback = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const feedback = await prisma.reviewFeedback.findMany({ where: { businessId: business.id }, orderBy: { createdAt: 'desc' }, take: 500 });
    res.json({ success: true, feedback });
  } catch (err) { next(err); }
};

// ─── Public review page (no sign-in) ─────────────────────────────────────────

async function liveBusiness(id) {
  const business = await prisma.reviewBusiness.findUnique({ where: { id: String(id).slice(0, 40) } });
  if (!business || !business.active) return null;
  const account = await prisma.reviewBoosterAccount.findUnique({ where: { userId: business.userId } });
  return account ? { business, account } : null;
}

exports.publicPage = async (req, res, next) => {
  try {
    const live = await liveBusiness(req.params.id);
    if (!live) return res.status(404).json({ success: false, message: 'This page is not available.' });
    const { business, account } = live;
    res.json({
      success: true,
      business: {
        name: business.name, color: business.color, language: business.language,
        googleReviewUrl: business.googleReviewUrl, branding: limitsOf(account.plan).branding,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/review-booster/public/:id/event — { type: 'view' | 'google' }
exports.publicEvent = async (req, res, next) => {
  try {
    const field = { view: 'views', google: 'googleClicks' }[req.body?.type];
    if (!field) return res.status(400).json({ success: false, message: 'Unknown event.' });
    const { count } = await prisma.reviewBusiness.updateMany({ where: { id: String(req.params.id).slice(0, 40), active: true }, data: { [field]: { increment: 1 } } });
    if (!count) return res.status(404).json({ success: false, message: 'This page is not available.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/review-booster/public/:id/feedback — { message, rating?, name?, contact? }
exports.publicFeedback = async (req, res, next) => {
  try {
    const live = await liveBusiness(req.params.id);
    if (!live) return res.status(404).json({ success: false, message: 'This page is not available.' });
    const { business } = live;
    const b = req.body || {};
    const message = String(b.message || '').trim().slice(0, 2000);
    if (!message) return res.status(400).json({ success: false, message: 'Please write a message.' });
    const r = Number(b.rating);
    const rating = Number.isInteger(r) && r >= 1 && r <= 5 ? r : null;

    const fb = await prisma.reviewFeedback.create({
      data: {
        businessId: business.id, rating, message,
        name: String(b.name || '').trim().slice(0, 100) || null,
        contact: String(b.contact || '').trim().slice(0, 160) || null,
      },
    });
    await notifyClient(business.userId, {
      type:    'new_message',
      title:   `Private feedback for ${business.name}${rating ? ` (${rating}★)` : ''}`,
      message: `${fb.name ? `${fb.name}: ` : ''}"${message.slice(0, 160)}"${fb.contact ? ` — ${fb.contact}` : ''}`,
      link:    `/review-booster/businesses/${business.id}`,
      metadata: { businessId: business.id, feedbackId: fb.id },
    }, { email: true });
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.adminListAccounts = async (req, res, next) => {
  try {
    res.json({ success: true, accounts: await prisma.reviewBoosterAccount.findMany({ select: { userId: true, plan: true } }) });
  } catch (err) { next(err); }
};

exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const user = await prisma.user.findUnique({ where: { id: String(req.body?.userId || '') }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.reviewBoosterAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.reviewBoosterAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    await prisma.reviewBoosterAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Review Booster: you're now on ${label}` : 'MBN Review Booster is active on your account',
        message: existing ? `Your MBN Review Booster plan is now ${label}.` : `Your ${label} plan is active. Open MBN Review Booster and add your first business.`,
        link:    '/review-booster',
      }, { email: true });
    }
    res.json({ success: true, access: true });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
