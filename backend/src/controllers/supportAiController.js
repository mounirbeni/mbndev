const { adminOpenaiKey } = require('../lib/adminKeys');
const prisma = require('../lib/prisma');
const { notifyClient } = require('../lib/notifications');
const { encrypt, decrypt } = require('../lib/leadsAi/crypto');
const { assertPublicUrl } = require('../lib/leadsAi/audit');
const { crawlSite, chunkText, rankChunks } = require('../lib/supportAi/knowledge');
const { answerVisitor } = require('../lib/supportAi/answer');
const { originAllowed, hostOf } = require('../lib/supportAi/origin');

const PLAN_LIMITS = {
  starter: { bots: 1, messages: 1000, branding: true },
  pro:     { bots: 5, messages: 5000, branding: true },
  agency:  { bots: 25, messages: 20000, branding: false },
};
const PLANS = Object.keys(PLAN_LIMITS);
const MAX_CONVERSATION_MESSAGES = 40;
const MAX_CHUNKS = 250;
const monthKey = () => new Date().toISOString().slice(0, 7);
const limitsOf = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

/** Owner's OpenAI key; falls back to the one saved in Leads AI or Local Growth. */
async function openaiKeyFor(account) {
  const own = decrypt(account.openaiKeyEnc);
  if (own) return own;
  const [leads, lg] = await Promise.all([
    prisma.leadsAiAccount.findUnique({ where: { userId: account.userId }, select: { openaiKeyEnc: true } }),
    prisma.localGrowthAccount.findUnique({ where: { userId: account.userId }, select: { openaiKeyEnc: true } }),
  ]);
  return decrypt(leads?.openaiKeyEnc) || decrypt(lg?.openaiKeyEnc) || await adminOpenaiKey(account.userId);
}

async function publicAccount(a) {
  const lim = limitsOf(a.plan);
  const used = a.messageMonth === monthKey() ? a.messageCount : 0;
  const bots = await prisma.supportBot.count({ where: { userId: a.userId } });
  return {
    plan: a.plan,
    bots: { used: bots, limit: lim.bots },
    messages: { used, limit: lim.messages },
    hasOpenaiKey: Boolean(await openaiKeyFor(a)),
  };
}

exports.requireAccess = async (req, res, next) => {
  try {
    let account = await prisma.supportAiAccount.findUnique({ where: { userId: req.user.id } });
    if (!account && req.user.role === 'admin') {
      account = await prisma.supportAiAccount.create({ data: { userId: req.user.id, plan: 'agency' } });
    }
    if (!account) return res.status(403).json({ success: false, code: 'NO_LICENSE', message: 'MBN Support AI is not active on this account.' });
    req.saAccount = account;
    next();
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try { res.json({ success: true, account: await publicAccount(req.saAccount) }); } catch (err) { next(err); }
};

// PUT /api/support-ai/settings — { openaiKey } ('' clears)
exports.saveSettings = async (req, res, next) => {
  try {
    const v = String(req.body?.openaiKey ?? '').trim();
    if (v && !/^sk-[A-Za-z0-9_-]{20,200}$/.test(v)) return res.status(400).json({ success: false, message: "That OpenAI key doesn't look valid." });
    const account = await prisma.supportAiAccount.update({ where: { id: req.saAccount.id }, data: { openaiKeyEnc: v ? encrypt(v) : null } });
    res.json({ success: true, account: await publicAccount(account) });
  } catch (err) { next(err); }
};

// ─── Bots ────────────────────────────────────────────────────────────────────

async function ownBot(req, res) {
  const bot = await prisma.supportBot.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!bot) res.status(404).json({ success: false, message: 'Assistant not found.' });
  return bot;
}

/** Crawl the bot's website and replace its knowledge. */
async function trainBot(bot) {
  const pages = await crawlSite(bot.websiteUrl, { maxPages: 25, timeBudgetMs: 40000 });
  const rows = [];
  for (const p of pages) {
    for (const text of chunkText(p.text)) {
      if (rows.length >= MAX_CHUNKS) break;
      rows.push({ botId: bot.id, url: p.url.slice(0, 500), title: p.title ? p.title.slice(0, 200) : null, text });
    }
  }
  await prisma.$transaction([
    prisma.supportChunk.deleteMany({ where: { botId: bot.id } }),
    ...(rows.length ? [prisma.supportChunk.createMany({ data: rows })] : []),
    prisma.supportBot.update({ where: { id: bot.id }, data: { pageCount: pages.length, trainedAt: new Date() } }),
  ]);
  return { pages: pages.length, chunks: rows.length };
}

exports.listBots = async (req, res, next) => {
  try {
    const bots = await prisma.supportBot.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { leads: true, conversations: true } } },
    });
    res.json({ success: true, bots });
  } catch (err) { next(err); }
};

// POST /api/support-ai/bots — { name, websiteUrl }
exports.createBot = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    let websiteUrl = String(req.body?.websiteUrl || '').trim();
    if (!/^https?:\/\//i.test(websiteUrl)) websiteUrl = `https://${websiteUrl}`;
    if (!name || !hostOf(websiteUrl)) return res.status(400).json({ success: false, message: 'Give the assistant a name and the website address.' });
    try { await assertPublicUrl(websiteUrl); } catch { return res.status(400).json({ success: false, message: "That website can't be reached." }); }

    const pub = await publicAccount(req.saAccount);
    if (pub.bots.used >= pub.bots.limit) {
      return res.status(429).json({ success: false, code: 'LIMIT_REACHED', message: `Your plan includes ${pub.bots.limit} assistant${pub.bots.limit === 1 ? '' : 's'}. Upgrade for more.` });
    }
    const bot = await prisma.supportBot.create({
      data: {
        userId: req.user.id, name, websiteUrl: websiteUrl.slice(0, 300),
        welcome: `Hi! 👋 Welcome to ${name}. How can I help you today?`.slice(0, 300),
        allowedDomains: [hostOf(websiteUrl)],
      },
    });
    const training = await trainBot(bot);
    res.status(201).json({ success: true, bot: await prisma.supportBot.findUnique({ where: { id: bot.id } }), training });
  } catch (err) { next(err); }
};

exports.getBot = async (req, res, next) => {
  try {
    const bot = await ownBot(req, res);
    if (!bot) return;
    const [leads, conversations] = await Promise.all([
      prisma.supportLead.count({ where: { botId: bot.id } }),
      prisma.supportConversation.count({ where: { botId: bot.id } }),
    ]);
    res.json({ success: true, bot, stats: { leads, conversations } });
  } catch (err) { next(err); }
};

// PUT /api/support-ai/bots/:id
exports.updateBot = async (req, res, next) => {
  try {
    const bot = await ownBot(req, res);
    if (!bot) return;
    const b = req.body || {};
    const data = {};
    if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 80) || bot.name;
    if (b.welcome !== undefined) data.welcome = String(b.welcome).trim().slice(0, 300) || bot.welcome;
    if (b.color !== undefined) {
      if (!/^#[0-9a-f]{6}$/i.test(b.color)) return res.status(400).json({ success: false, message: 'Colour must look like #7c3aed.' });
      data.color = b.color;
    }
    if (b.allowedDomains !== undefined) {
      const list = (Array.isArray(b.allowedDomains) ? b.allowedDomains : String(b.allowedDomains).split(/[\s,]+/))
        .map((d) => String(d).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''))
        .filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)).slice(0, 10);
      data.allowedDomains = list;
    }
    if (b.handoffWhatsapp !== undefined) data.handoffWhatsapp = String(b.handoffWhatsapp).replace(/[^\d+]/g, '').slice(0, 20) || null;
    if (b.handoffEmail !== undefined) {
      const e = String(b.handoffEmail).trim().slice(0, 160);
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ success: false, message: 'Invalid email.' });
      data.handoffEmail = e || null;
    }
    if (b.notes !== undefined) data.notes = String(b.notes).slice(0, 6000) || null;
    if (b.active !== undefined) data.active = Boolean(b.active);
    res.json({ success: true, bot: await prisma.supportBot.update({ where: { id: bot.id }, data }) });
  } catch (err) { next(err); }
};

exports.retrainBot = async (req, res, next) => {
  try {
    const bot = await ownBot(req, res);
    if (!bot) return;
    const training = await trainBot(bot);
    res.json({ success: true, training, bot: await prisma.supportBot.findUnique({ where: { id: bot.id } }) });
  } catch (err) { next(err); }
};

exports.deleteBot = async (req, res, next) => {
  try {
    const { count } = await prisma.supportBot.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Assistant not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.listConversations = async (req, res, next) => {
  try {
    const bot = await ownBot(req, res);
    if (!bot) return;
    const conversations = await prisma.supportConversation.findMany({ where: { botId: bot.id }, orderBy: { updatedAt: 'desc' }, take: 100 });
    res.json({ success: true, conversations });
  } catch (err) { next(err); }
};

exports.listLeads = async (req, res, next) => {
  try {
    const bot = await ownBot(req, res);
    if (!bot) return;
    const leads = await prisma.supportLead.findMany({ where: { botId: bot.id }, orderBy: { createdAt: 'desc' }, take: 500 });
    res.json({ success: true, leads });
  } catch (err) { next(err); }
};

// ─── Public widget (no sign-in) ──────────────────────────────────────────────

async function liveBot(botId) {
  const bot = await prisma.supportBot.findUnique({ where: { id: String(botId).slice(0, 40) } });
  if (!bot || !bot.active) return null;
  const account = await prisma.supportAiAccount.findUnique({ where: { userId: bot.userId } });
  return account ? { bot, account } : null;
}

exports.widgetConfig = async (req, res, next) => {
  try {
    const live = await liveBot(req.params.botId);
    if (!live) return res.status(404).json({ success: false, message: 'Assistant unavailable.' });
    const { bot, account } = live;
    res.json({
      success: true,
      bot: { name: bot.name, welcome: bot.welcome, color: bot.color, whatsapp: bot.handoffWhatsapp, branding: limitsOf(account.plan).branding },
    });
  } catch (err) { next(err); }
};

// POST /api/support-ai/widget/:botId/chat — { message, visitorId, conversationId?, origin? }
exports.widgetChat = async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim().slice(0, 1000);
    const visitorId = String(req.body?.visitorId || '').slice(0, 64);
    if (!message || !visitorId) return res.status(400).json({ success: false, message: 'Empty message.' });

    const live = await liveBot(req.params.botId);
    if (!live) return res.status(404).json({ success: false, message: 'Assistant unavailable.' });
    const { bot, account } = live;
    if (!originAllowed(bot, req.body?.origin)) return res.status(403).json({ success: false, message: 'This assistant is not enabled on this website.' });

    const lim = limitsOf(account.plan);
    const month = monthKey();
    const used = account.messageMonth === month ? account.messageCount : 0;
    const apiKey = await openaiKeyFor(account);
    const offline = !apiKey || used >= lim.messages;

    let convo = req.body?.conversationId
      ? await prisma.supportConversation.findFirst({ where: { id: String(req.body.conversationId), botId: bot.id, visitorId } })
      : null;
    const history = Array.isArray(convo?.messages) ? convo.messages : [];

    let reply;
    let wantsLead = false;
    if (offline || history.length >= MAX_CONVERSATION_MESSAGES) {
      reply = "I can't answer right now, but the team will get back to you. Leave your contact details and they'll reach out.";
      wantsLead = true;
    } else {
      const chunks = await prisma.supportChunk.findMany({ where: { botId: bot.id } });
      const relevant = rankChunks(chunks, `${history.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join(' ')} ${message}`);
      try {
        ({ reply, wantsLead } = await answerVisitor({ apiKey, bot, chunks: relevant, history, message }));
      } catch {
        reply = "Sorry, I'm having trouble answering right now. Leave your contact details and the team will get back to you.";
        wantsLead = true;
      }
      await prisma.supportAiAccount.update({
        where: { id: account.id },
        data: account.messageMonth === month ? { messageCount: { increment: 1 } } : { messageMonth: month, messageCount: 1 },
      });
    }

    const now = new Date().toISOString();
    const messages = [...history, { role: 'user', content: message, at: now }, { role: 'assistant', content: reply, at: now }];
    convo = convo
      ? await prisma.supportConversation.update({ where: { id: convo.id }, data: { messages } })
      : await prisma.supportConversation.create({ data: { botId: bot.id, visitorId, messages } });

    res.json({ success: true, reply, wantsLead, conversationId: convo.id });
  } catch (err) { next(err); }
};

// POST /api/support-ai/widget/:botId/lead — { name?, email?, phone?, message?, conversationId? }
exports.widgetLead = async (req, res, next) => {
  try {
    const live = await liveBot(req.params.botId);
    if (!live) return res.status(404).json({ success: false, message: 'Assistant unavailable.' });
    const { bot } = live;
    const b = req.body || {};
    const email = String(b.email || '').trim().slice(0, 160);
    const phone = String(b.phone || '').replace(/[^\d+\s()-]/g, '').trim().slice(0, 30);
    if (!email && !phone) return res.status(400).json({ success: false, message: 'Leave an email or a phone number.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'That email looks wrong.' });

    let conversationId = null;
    if (b.conversationId) {
      const c = await prisma.supportConversation.findFirst({ where: { id: String(b.conversationId), botId: bot.id }, select: { id: true } });
      conversationId = c?.id || null;
    }
    const lead = await prisma.supportLead.create({
      data: {
        botId: bot.id, conversationId,
        name: String(b.name || '').trim().slice(0, 100) || null,
        email: email || null, phone: phone || null,
        message: String(b.message || '').trim().slice(0, 1000) || null,
      },
    });
    await notifyClient(bot.userId, {
      type:    'new_message',
      title:   `New lead from your ${bot.name} assistant`,
      message: [lead.name, lead.email, lead.phone].filter(Boolean).join(' · ') + (lead.message ? ` — "${lead.message.slice(0, 120)}"` : ''),
      link:    `/support-ai/bots/${bot.id}`,
      metadata: { botId: bot.id, leadId: lead.id },
    }, { email: true });
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.adminListAccounts = async (req, res, next) => {
  try {
    res.json({ success: true, accounts: await prisma.supportAiAccount.findMany({ select: { userId: true, plan: true } }) });
  } catch (err) { next(err); }
};

exports.adminSetAccess = async (req, res, next) => {
  try {
    const plan = req.body?.plan ?? null;
    if (plan !== null && !PLANS.includes(plan)) return res.status(400).json({ success: false, message: `plan must be one of ${PLANS.join(', ')} or null` });
    const user = await prisma.user.findUnique({ where: { id: String(req.body?.userId || '') }, select: { id: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (plan === null) {
      await prisma.supportAiAccount.deleteMany({ where: { userId: user.id } });
      return res.json({ success: true, access: false });
    }
    const existing = await prisma.supportAiAccount.findUnique({ where: { userId: user.id }, select: { plan: true } });
    await prisma.supportAiAccount.upsert({ where: { userId: user.id }, create: { userId: user.id, plan }, update: { plan } });
    if (!existing || existing.plan !== plan) {
      const label = plan[0].toUpperCase() + plan.slice(1);
      await notifyClient(user.id, {
        type:    'status_update',
        title:   existing ? `MBN Support AI: you're now on ${label}` : 'MBN Support AI is active on your account',
        message: existing ? `Your MBN Support AI plan is now ${label}.` : `Your ${label} plan is active. Open MBN Support AI and create your first assistant.`,
        link:    '/support-ai',
      }, { email: true });
    }
    res.json({ success: true, access: true });
  } catch (err) { next(err); }
};

exports.PLAN_LIMITS = PLAN_LIMITS;
