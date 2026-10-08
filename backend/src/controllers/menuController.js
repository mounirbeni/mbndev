const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { adminOpenaiKey } = require('../lib/adminKeys');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const {
  LANGUAGES, MenuError, cleanRestaurantPatch, cleanMenu, photoIdsIn, priceOrder, cleanBooking, tableLabel, text,
} = require('../lib/menu/validate');
const { decodePhoto } = require('../lib/menu/photo');
const { translateRestaurant } = require('../lib/menu/translate');
const { sampleRestaurant } = require('../lib/menu/sample');

const PLAN_LIMITS = {
  starter: { restaurants: 1, branding: true },
  pro:     { restaurants: 3, branding: true },
  agency:  { restaurants: 25, branding: false },
};
const PLANS = Object.keys(PLAN_LIMITS);
const limitsOf = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
const MAX_PHOTOS = 450;
const OPENAI_KEY = /^sk-[A-Za-z0-9_-]{20,200}$/;
const STATUSES = {
  order: ['new', 'preparing', 'ready', 'done', 'cancelled'],
  booking: ['new', 'confirmed', 'declined'],
  waiter: ['new', 'done'],
  bill: ['new', 'done'],
};

const fail = (res, err, next) => (err instanceof MenuError ? res.status(400).json({ success: false, message: err.message }) : next(err));

/** The owner's OpenAI key; falls back to keys saved in the other MBN products. */
async function openaiKeyFor(account) {
  let key = decrypt(account.openaiKeyEnc);
  if (!key) {
    const where = { where: { userId: account.userId }, select: { openaiKeyEnc: true } };
    const found = await Promise.all([
      prisma.supportAiAccount.findUnique(where), prisma.proposalAccount.findUnique(where),
      prisma.reviewBoosterAccount.findUnique(where), prisma.localGrowthAccount.findUnique(where), prisma.leadsAiAccount.findUnique(where),
    ]);
    key = found.map((a) => decrypt(a?.openaiKeyEnc)).find(Boolean);
  }
  return key || adminOpenaiKey(account.userId);
}

async function publicAccount(a) {
  const [restaurants, key] = await Promise.all([prisma.menuRestaurant.count({ where: { userId: a.userId } }), openaiKeyFor(a)]);
  return { plan: a.plan, restaurants: { used: restaurants, limit: limitsOf(a.plan).restaurants }, hasOpenaiKey: Boolean(key) };
}

exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.menuAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') account = await prisma.menuAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    if (!account) return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Menu is not active on this account.' });
    req.menuAccount = account;
    next();
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try { res.json({ success: true, account: await publicAccount(req.menuAccount) }); } catch (err) { next(err); }
};

// PUT /api/menu/settings — { openaiKey } ('' clears)
exports.saveSettings = async (req, res, next) => {
  try {
    const v = String(req.body?.openaiKey ?? '').trim();
    if (v && !OPENAI_KEY.test(v)) return res.status(400).json({ success: false, message: "That OpenAI key doesn't look valid." });
    const account = await prisma.menuAccount.update({ where: { id: req.menuAccount.id }, data: { openaiKeyEnc: v ? encrypt(v) : null } });
    res.json({ success: true, account: await publicAccount(account) });
  } catch (err) { next(err); }
};

// ─── Restaurants ─────────────────────────────────────────────────────────────

const LIST_FIELDS = { id: true, name: true, color: true, languages: true, active: true, views: true, logoPhotoId: true, updatedAt: true, createdAt: true };

async function ownRestaurant(req, res) {
  const r = await prisma.menuRestaurant.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!r) res.status(404).json({ success: false, message: 'Restaurant not found.' });
  return r;
}

exports.listRestaurants = async (req, res, next) => {
  try {
    const rows = await prisma.menuRestaurant.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, select: { ...LIST_FIELDS, menu: true } });
    const open = await prisma.menuRequest.groupBy({ by: ['restaurantId'], where: { restaurantId: { in: rows.map((r) => r.id) }, status: 'new' }, _count: true });
    const openBy = Object.fromEntries(open.map((o) => [o.restaurantId, o._count]));
    res.json({
      success: true,
      restaurants: rows.map(({ menu, ...r }) => ({ ...r, dishes: (menu?.categories || []).reduce((n, c) => n + (c.items?.length || 0), 0), newRequests: openBy[r.id] || 0 })),
    });
  } catch (err) { next(err); }
};

// POST /api/menu/restaurants — { name, languages?, currency?, timezone?, sample? }
exports.createRestaurant = async (req, res, next) => {
  try {
    const pub = await publicAccount(req.menuAccount);
    if (pub.restaurants.used >= pub.restaurants.limit) {
      return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `Your plan includes ${pub.restaurants.limit} restaurant${pub.restaurants.limit === 1 ? '' : 's'}. Upgrade for more.` });
    }
    const b = req.body || {};
    const base = b.sample ? sampleRestaurant() : {
      languages: ['en'], defaultLanguage: 'en', currency: 'EUR', timezone: 'Europe/Lisbon',
      hours: { 0: [[720, 960]], 1: [], 2: [[720, 900], [1140, 1380]], 3: [[720, 900], [1140, 1380]], 4: [[720, 900], [1140, 1380]], 5: [[720, 900], [1140, 1410]], 6: [[720, 900], [1140, 1410]] },
      payments: ['card', 'cash'], menu: { categories: [] },
    };
    const data = cleanRestaurantPatch({ ...base, ...b, name: b.name ?? base.name, menu: base.menu }, {});
    if (!data.name) throw new MenuError('Give the restaurant a name.');
    const restaurant = await prisma.menuRestaurant.create({ data: { userId: req.user.id, ...data } });
    res.status(201).json({ success: true, restaurant });
  } catch (err) { fail(res, err, next); }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (r) res.json({ success: true, restaurant: r, branding: limitsOf(req.menuAccount.plan).branding });
  } catch (err) { next(err); }
};

/** Drops photos nothing points to any more (older than an hour, so an upload waiting to be saved survives). */
async function pruneUnusedPhotos(restaurant) {
  const keep = [...photoIdsIn(restaurant)];
  await prisma.menuPhoto.deleteMany({
    where: { restaurantId: restaurant.id, id: { notIn: keep.length ? keep : ['-'] }, createdAt: { lt: new Date(Date.now() - 3600000) } },
  });
}

// PUT /api/menu/restaurants/:id — any restaurant field and/or { menu }
exports.updateRestaurant = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (!r) return;
    const data = cleanRestaurantPatch(req.body || {}, r);
    const restaurant = await prisma.menuRestaurant.update({ where: { id: r.id }, data });
    if (data.menu || 'logoPhotoId' in data || 'coverPhotoId' in data) await pruneUnusedPhotos(restaurant).catch(() => {});
    res.json({ success: true, restaurant });
  } catch (err) { fail(res, err, next); }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const { count } = await prisma.menuRestaurant.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/menu/restaurants/:id/photos — { data: "data:image/webp;base64,…" }
exports.uploadPhoto = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (!r) return;
    const photo = decodePhoto(req.body?.data);
    if (photo.error) return res.status(400).json({ success: false, message: photo.error });
    if (await prisma.menuPhoto.count({ where: { restaurantId: r.id } }) >= MAX_PHOTOS) {
      return res.status(429).json({ success: false, message: `A menu can hold up to ${MAX_PHOTOS} photos.` });
    }
    const saved = await prisma.menuPhoto.create({ data: { restaurantId: r.id, mime: photo.mime, size: photo.buffer.length, data: photo.buffer }, select: { id: true } });
    res.status(201).json({ success: true, id: saved.id });
  } catch (err) { next(err); }
};

// POST /api/menu/restaurants/:id/translate — { from, to } fills the missing `to` text.
exports.translate = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (!r) return;
    const { from, to } = req.body || {};
    if (!LANGUAGES.includes(from) || !LANGUAGES.includes(to) || from === to) return res.status(400).json({ success: false, message: 'Choose the language to translate from and to.' });
    const apiKey = await openaiKeyFor(req.menuAccount);
    if (!apiKey) return res.status(400).json({ success: false, code: 'NO_KEY', message: 'Add your OpenAI key in MBN Menu settings to translate with AI.' });
    const doc = { name: r.name, tagline: { ...r.tagline }, about: { ...r.about }, menu: JSON.parse(JSON.stringify(r.menu || { categories: [] })) };
    let result;
    try {
      result = await translateRestaurant({ apiKey, restaurant: doc, from, to, deadline: Date.now() + 38000 });
    } catch (e) {
      return res.status(502).json({ success: false, message: `Translation failed: ${e.message}` });
    }
    const languages = r.languages.includes(to) ? r.languages : [...r.languages, to];
    const restaurant = await prisma.menuRestaurant.update({
      where: { id: r.id },
      data: { tagline: doc.tagline, about: doc.about, menu: cleanMenu(doc.menu), languages },
    });
    res.json({ success: true, restaurant, ...result });
  } catch (err) { next(err); }
};

// ─── Guest requests (owner side) ─────────────────────────────────────────────

// GET /api/menu/restaurants/:id/requests?scope=open|all
exports.listRequests = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (!r) return;
    const where = { restaurantId: r.id };
    if (req.query.scope !== 'all') {
      where.OR = [
        { status: { in: ['new', 'preparing', 'ready'] } },
        { kind: 'booking', status: 'confirmed', date: { gte: new Date(Date.now() - 86400000).toISOString().slice(0, 10) } },
      ];
    }
    const requests = await prisma.menuRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
    res.json({ success: true, requests });
  } catch (err) { next(err); }
};

// PUT /api/menu/restaurants/:id/requests/:requestId — { status }
exports.updateRequest = async (req, res, next) => {
  try {
    const r = await ownRestaurant(req, res);
    if (!r) return;
    const request = await prisma.menuRequest.findFirst({ where: { id: req.params.requestId, restaurantId: r.id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    const status = String(req.body?.status || '');
    if (!STATUSES[request.kind]?.includes(status)) return res.status(400).json({ success: false, message: `Status must be one of ${STATUSES[request.kind].join(', ')}.` });
    res.json({ success: true, request: await prisma.menuRequest.update({ where: { id: request.id }, data: { status } }) });
  } catch (err) { next(err); }
};

// ─── Public menu (no sign-in) ────────────────────────────────────────────────

async function liveRestaurant(id) {
  const r = await prisma.menuRestaurant.findUnique({ where: { id: String(id).slice(0, 40) } });
  if (!r || !r.active) return null;
  const account = await prisma.menuAccount.findUnique({ where: { userId: r.userId }, select: { plan: true } });
  return account ? { restaurant: r, account } : null;
}

exports.publicMenu = async (req, res, next) => {
  try {
    const live = await liveRestaurant(req.params.id);
    if (!live) return res.status(404).json({ success: false, message: 'This menu is not available.' });
    const { restaurant: r, account } = live;
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      restaurant: {
        id: r.id, name: r.name, tagline: r.tagline, about: r.about, color: r.color,
        languages: r.languages, defaultLanguage: r.defaultLanguage, currency: r.currency, timezone: r.timezone,
        address: r.address, phone: r.phone, whatsapp: r.whatsapp, email: r.email, instagram: r.instagram, website: r.website,
        wifiName: r.wifiName, wifiPassword: r.wifiPassword, logoPhotoId: r.logoPhotoId, coverPhotoId: r.coverPhotoId,
        hours: r.hours, payments: r.payments, ordering: r.ordering, booking: r.booking, waiterCall: r.waiterCall,
        coverCharge: r.coverCharge, menu: r.menu, branding: limitsOf(account.plan).branding,
      },
    });
  } catch (err) { next(err); }
};

exports.publicView = async (req, res, next) => {
  try {
    const { count } = await prisma.menuRestaurant.updateMany({ where: { id: String(req.params.id).slice(0, 40), active: true }, data: { views: { increment: 1 } } });
    if (!count) return res.status(404).json({ success: false, message: 'This menu is not available.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

const DISABLED = { order: 'ordering', booking: 'booking', waiter: 'waiterCall', bill: 'waiterCall' };

// POST /api/menu/public/:id/requests — { kind: order|booking|waiter|bill, … }
exports.publicRequest = async (req, res, next) => {
  try {
    const live = await liveRestaurant(req.params.id);
    if (!live) return res.status(404).json({ success: false, message: 'This menu is not available.' });
    const { restaurant: r } = live;
    const b = req.body || {};
    const kind = String(b.kind || '');
    if (!DISABLED[kind]) return res.status(400).json({ success: false, message: 'Unknown request.' });
    if (!r[DISABLED[kind]]) return res.status(403).json({ success: false, message: 'This restaurant does not take this request online.' });
    const language = LANGUAGES.includes(b.language) ? b.language : null;
    const data = { restaurantId: r.id, kind, language, notes: text(b.notes, 300) || null };

    if (kind === 'booking') {
      Object.assign(data, cleanBooking(b, r));
      data.name = text(b.name, 80);
      data.phone = text(b.phone, 24);
      if (!data.name) throw new MenuError('Please enter your name.');
      if (!/^\+?[0-9 ().-]{6,24}$/.test(data.phone || '')) throw new MenuError('Please enter a phone number we can reach you on.');
      if (b.terrace) data.notes = ['Terrace preferred', data.notes].filter(Boolean).join(' · ').slice(0, 300);
    } else {
      data.tableLabel = tableLabel(b.table);
      if (!data.tableLabel) throw new MenuError('Enter your table number.');
      if (kind === 'order') {
        const priced = priceOrder(r.menu, b.items);
        data.items = priced.items;
        data.total = priced.total;
        data.name = text(b.name, 80) || null;
      }
      if (kind === 'bill') data.notes = text(b.payment, 20) || null;
      if (kind !== 'order') {
        // one open call per table is enough — repeat taps just refresh it
        const open = await prisma.menuRequest.findFirst({ where: { restaurantId: r.id, kind, tableLabel: data.tableLabel, status: 'new' } });
        if (open) {
          const request = await prisma.menuRequest.update({ where: { id: open.id }, data: { notes: data.notes ?? open.notes } });
          return res.json({ success: true, request: { id: request.id, kind, status: request.status } });
        }
      }
    }

    const request = await prisma.menuRequest.create({ data });
    const money = (n) => new Intl.NumberFormat('en', { style: 'currency', currency: r.currency }).format(n);
    const title = {
      order: `New order · table ${data.tableLabel} · ${money(data.total || 0)}`,
      booking: `New booking · ${data.guests} guest${data.guests === 1 ? '' : 's'} · ${data.date} ${data.time}`,
      waiter: `Table ${data.tableLabel} is calling a waiter`,
      bill: `Table ${data.tableLabel} asked for the bill`,
    }[kind];
    const message = kind === 'order'
      ? data.items.map((i) => `${i.qty}× ${Object.values(i.name)[0]}`).join(', ').slice(0, 200)
      : kind === 'booking' ? `${data.name} · ${data.phone}${data.notes ? ` · ${data.notes}` : ''}` : r.name;
    notifyClient(r.userId, { type: 'new_message', title: `${r.name}: ${title}`, message, link: `/menu/r/${r.id}?tab=live`, metadata: { restaurantId: r.id, requestId: request.id } }, { email: kind === 'booking' })
      .catch(() => {});
    res.status(201).json({ success: true, request: { id: request.id, kind, status: request.status, total: request.total } });
  } catch (err) { fail(res, err, next); }
};

// GET /api/menu/public/:id/requests/:requestId — status for the guest's tracker
exports.publicRequestStatus = async (req, res, next) => {
  try {
    const request = await prisma.menuRequest.findFirst({
      where: { id: String(req.params.requestId).slice(0, 40), restaurantId: String(req.params.id).slice(0, 40) },
      select: { id: true, kind: true, status: true, total: true, createdAt: true, updatedAt: true },
    });
    if (!request) return res.status(404).json({ success: false, message: 'Not found.' });
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, request });
  } catch (err) { next(err); }
};

// GET /api/menu/photo/:photoId — public, immutable (a new upload gets a new id)
exports.photo = async (req, res, next) => {
  try {
    const p = await prisma.menuPhoto.findUnique({ where: { id: String(req.params.photoId).slice(0, 40) }, select: { mime: true, data: true } });
    if (!p) return res.status(404).end();
    res.setHeader('Content-Type', p.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.end(Buffer.from(p.data));
  } catch (err) { next(err); }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.adminListAccounts = async (req, res, next) => {
  try { res.json({ success: true, accounts: await prisma.menuAccount.findMany({ select: { userId: true, plan: true } }) }); } catch (err) { next(err); }
};

exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const user = await prisma.user.findUnique({ where: { id: String(req.body?.userId || '') }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.menuAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.menuAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    await prisma.menuAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Menu: you're now on ${label}` : 'MBN Menu is active on your account',
        message: existing ? `Your MBN Menu plan is now ${label}.` : `Your ${label} plan is active. Open MBN Menu and create your first restaurant menu.`,
        link:    '/menu',
      }, { email: true });
    }
    res.json({ success: true, access: true });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
