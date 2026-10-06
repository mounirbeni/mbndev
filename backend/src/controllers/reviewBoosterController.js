const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const { searchPlaces, PlacesError } = require('../lib/leadsAi/places');
const { normalizeReviewUrl } = require('../lib/reviewBooster/link');
const { checkBusiness, placeIdFromUrl } = require('../lib/reviewBooster/monitor');
const { draftReply } = require('../lib/reviewBooster/reply');

const PLAN_LIMITS = {
  starter: { businesses: 1, branding: true },
  pro:     { businesses: 5, branding: true },
  agency:  { businesses: 25, branding: false },
};
const PLANS = Object.keys(PLAN_LIMITS);
const LANGUAGES = ['en', 'fr', 'ar', 'es'];
const limitsOf = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
const KEY_PATTERNS = { googleKeyEnc: /^[A-Za-z0-9_-]{20,80}$/, openaiKeyEnc: /^sk-[A-Za-z0-9_-]{20,200}$/ };
const PLACE_ID = /^[A-Za-z0-9_-]{10,300}$/;
const CHECK_COOLDOWN_MS = 5 * 60 * 1000;

/** The owner's keys; falls back to the ones saved in the other MBN products. */
async function getKeys(account) {
  let google = decrypt(account.googleKeyEnc);
  let openai = decrypt(account.openaiKeyEnc);
  if (!google || !openai) {
    const where = { where: { userId: account.userId } };
    const [lg, leads, sa] = await Promise.all([
      prisma.localGrowthAccount.findUnique({ ...where, select: { googleKeyEnc: true, openaiKeyEnc: true } }),
      prisma.leadsAiAccount.findUnique({ ...where, select: { googleKeyEnc: true, openaiKeyEnc: true } }),
      prisma.supportAiAccount.findUnique({ ...where, select: { openaiKeyEnc: true } }),
    ]);
    google = google || decrypt(lg?.googleKeyEnc) || decrypt(leads?.googleKeyEnc);
    openai = openai || decrypt(lg?.openaiKeyEnc) || decrypt(leads?.openaiKeyEnc) || decrypt(sa?.openaiKeyEnc);
  }
  return { google: google || null, openai: openai || null };
}

async function publicAccount(a) {
  const [businesses, keys] = await Promise.all([prisma.reviewBusiness.count({ where: { userId: a.userId } }), getKeys(a)]);
  return {
    plan: a.plan,
    businesses: { used: businesses, limit: limitsOf(a.plan).businesses },
    hasGoogleKey: Boolean(keys.google),
    hasOpenaiKey: Boolean(keys.openai),
  };
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

// PUT /api/review-booster/settings — { googleKey?, openaiKey? } ('' clears)
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
    const account = await prisma.reviewBoosterAccount.update({ where: { id: req.rbAccount.id }, data });
    res.json({ success: true, account: await publicAccount(account) });
  } catch (err) { next(err); }
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
    const business = await prisma.reviewBusiness.create({ data: { userId: req.user.id, name, googleReviewUrl, language, placeId: placeIdFromUrl(googleReviewUrl) } });
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
      if (!business.placeId && b.placeId === undefined) data.placeId = placeIdFromUrl(url);
    }
    if (b.placeId !== undefined) {
      const placeId = String(b.placeId || '').trim();
      if (placeId && !PLACE_ID.test(placeId)) return res.status(400).json({ success: false, message: 'That Place ID looks wrong.' });
      data.placeId = placeId || null;
      if (placeId !== business.placeId) Object.assign(data, { rating: null, ratingCount: null, monitoredAt: null, monitorError: null });
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

// ─── Google monitoring ───────────────────────────────────────────────────────

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** Tell the owner about new Google reviews; email when one is 3★ or less. */
async function alertOwner(business, result) {
  if (!result.newCount) return;
  const negative = result.newReviews.filter((r) => r.rating <= 3);
  const shown = negative[0] || result.newReviews[0];
  const title = negative.length
    ? `New ${negative[0].rating}★ Google review for ${business.name} — reply soon`
    : `${result.newCount} new Google review${result.newCount === 1 ? '' : 's'} for ${business.name}`;
  const detail = shown
    ? `${stars(shown.rating)} ${shown.author || 'A customer'}${shown.text ? `: "${shown.text.slice(0, 160)}"` : ''}`
    : `You now have ${result.count} reviews.`;
  await notifyClient(business.userId, {
    type:    'new_message',
    title,
    message: `${detail} · Rating ${result.rating ?? '—'} (${result.count} reviews)`,
    link:    `/review-booster/businesses/${business.id}?tab=reviews`,
    metadata: { businessId: business.id },
  }, { email: negative.length > 0 });
}

const googleError = (err) => (err instanceof PlacesError ? `Google: ${err.message}` : 'Could not reach Google right now.');

// POST /api/review-booster/businesses/:id/place-search — { query }
exports.placeSearch = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const query = String(req.body?.query || '').trim().slice(0, 200);
    if (query.length < 3) return res.status(400).json({ success: false, message: 'Type the business name and city.' });
    const { google } = await getKeys(req.rbAccount);
    if (!google) return res.status(400).json({ success: false, code: 'NO_GOOGLE_KEY', message: 'Add your Google Places API key in Settings first.' });
    try {
      res.json({ success: true, results: await searchPlaces({ query, apiKey: google, max: 5 }) });
    } catch (err) {
      if (err instanceof PlacesError) return res.status(err.status).json({ success: false, message: googleError(err) });
      throw err;
    }
  } catch (err) { next(err); }
};

// POST /api/review-booster/businesses/:id/check — check Google now
exports.checkNow = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    if (!business.placeId) return res.status(400).json({ success: false, code: 'NO_PLACE', message: 'Connect the business to Google first.' });
    if (business.monitoredAt && Date.now() - business.monitoredAt.getTime() < CHECK_COOLDOWN_MS) {
      return res.status(429).json({ success: false, message: 'Checked a moment ago — try again in a few minutes.' });
    }
    const { google } = await getKeys(req.rbAccount);
    if (!google) return res.status(400).json({ success: false, code: 'NO_GOOGLE_KEY', message: 'Add your Google Places API key in Settings first.' });
    let result;
    try {
      result = await checkBusiness(prisma, business, google);
    } catch (err) {
      await prisma.reviewBusiness.update({ where: { id: business.id }, data: { monitorError: googleError(err).slice(0, 300) } });
      if (err instanceof PlacesError) return res.status(err.status).json({ success: false, message: googleError(err) });
      throw err;
    }
    await alertOwner(business, result);
    res.json({ success: true, newCount: result.newCount, business: await prisma.reviewBusiness.findUnique({ where: { id: business.id } }) });
  } catch (err) { next(err); }
};

// GET /api/review-booster/businesses/:id/reviews — latest reviews + rating trend
exports.listReviews = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const [reviews, snapshots] = await Promise.all([
      prisma.googleReview.findMany({ where: { businessId: business.id }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take: 100 }),
      prisma.reviewSnapshot.findMany({
        where: { businessId: business.id, createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'asc' },
        select: { rating: true, ratingCount: true, createdAt: true },
        take: 400,
      }),
    ]);
    res.json({ success: true, reviews, snapshots });
  } catch (err) { next(err); }
};

// POST /api/review-booster/businesses/:id/reviews/:reviewId/reply — AI draft
exports.replyDraft = async (req, res, next) => {
  try {
    const business = await ownBusiness(req, res);
    if (!business) return;
    const review = await prisma.googleReview.findFirst({ where: { id: req.params.reviewId, businessId: business.id } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    const { openai } = await getKeys(req.rbAccount);
    if (!openai) return res.status(400).json({ success: false, code: 'NO_OPENAI_KEY', message: 'Add your OpenAI API key in Settings to draft replies.' });
    let text;
    try {
      text = await draftReply({ apiKey: openai, business, review });
    } catch (err) {
      return res.status(502).json({ success: false, message: `AI: ${err.message}`.slice(0, 200) });
    }
    res.json({ success: true, review: await prisma.googleReview.update({ where: { id: review.id }, data: { replyDraft: text } }) });
  } catch (err) { next(err); }
};

// GET /api/review-booster/cron/monitor — daily Vercel Cron run (CRON_SECRET).
// Checks the businesses checked longest ago first, within the time budget;
// on Mondays also sends each owner a weekly summary per business.
exports.cronMonitor = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'Cron is not configured.' });
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ success: false, message: 'Unauthorized.' });

  const started = Date.now();
  const budgetMs = 45000;
  const monday = new Date().getUTCDay() === 1;
  const stats = { checked: 0, failed: 0, skipped: 0, summaries: 0 };
  const keysByUser = new Map();

  try {
    const businesses = await prisma.reviewBusiness.findMany({
      where: { active: true, placeId: { not: null } },
      orderBy: { monitoredAt: { sort: 'asc', nulls: 'first' } },
      take: 300,
    });
    for (const business of businesses) {
      if (Date.now() - started > budgetMs) break;
      if (business.monitoredAt && Date.now() - business.monitoredAt.getTime() < 6 * 60 * 60 * 1000) { stats.skipped++; continue; }
      if (!keysByUser.has(business.userId)) {
        const account = await prisma.reviewBoosterAccount.findUnique({ where: { userId: business.userId } });
        keysByUser.set(business.userId, account ? await getKeys(account) : null);
      }
      const keys = keysByUser.get(business.userId);
      if (!keys?.google) {
        stats.skipped++;
        if (keys) await prisma.reviewBusiness.update({ where: { id: business.id }, data: { monitorError: 'Add your Google Places API key in Settings to monitor reviews.' } });
        continue;
      }
      const weekAgo = monday
        ? await prisma.reviewSnapshot.findFirst({ where: { businessId: business.id, createdAt: { lte: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000) } }, orderBy: { createdAt: 'desc' } })
        : null;
      try {
        const result = await checkBusiness(prisma, business, keys.google);
        await alertOwner(business, result);
        stats.checked++;
        if (weekAgo) {
          const gained = Math.max(0, result.count - weekAgo.ratingCount);
          const diff = result.rating != null && weekAgo.rating != null ? Math.round((result.rating - weekAgo.rating) * 10) / 10 : 0;
          await notifyClient(business.userId, {
            type:    'status_update',
            title:   `Weekly Google summary — ${business.name}`,
            message: `Rating ${result.rating ?? '—'}${diff ? ` (${diff > 0 ? '+' : ''}${diff})` : ''} · ${result.count} reviews (+${gained} this week) · ${business.requestsSent} review requests sent so far.`,
            link:    `/review-booster/businesses/${business.id}?tab=reviews`,
          }, { email: true });
          stats.summaries++;
        }
      } catch (err) {
        stats.failed++;
        await prisma.reviewBusiness.update({ where: { id: business.id }, data: { monitorError: googleError(err).slice(0, 300) } }).catch(() => {});
      }
    }
    res.json({ success: true, stats });
  } catch (err) {
    console.error('[review-booster cron] failed:', err.message);
    res.status(500).json({ success: false, stats });
  }
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
