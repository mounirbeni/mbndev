const router  = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const prisma   = require('../lib/prisma');
const { sendEmail, templates } = require('../lib/email');

// ─── Default leads seed (22 prospects found in Morocco) ──────────────────────
const DEFAULT_LEADS = [
  // ── HOT: no website + has contact info ───────────────────────────────────
  { name: 'Riad Puchka',                type: 'riad',       city: 'Marrakech',   phone: '+212 682 875 839',  instagram: '@riadpuchka',              website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only riad. Offer Starter ($799) — show RiadConnect as proof.',        source: 'Instagram' },
  { name: 'Riad Imndi',                 type: 'riad',       city: 'Marrakech',   instagram: '@riadimndi',                                          website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only. DM with RiadConnect demo — direct match.',                      source: 'Instagram' },
  { name: 'Riad Sakura Chefchaouen',    type: 'riad',       city: 'Chefchaouen', instagram: '@riad_sakura_chefchaouen',                             website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only Chefchaouen riad. Offer Starter package.',                        source: 'Instagram' },
  { name: 'Nelia Marrakech',            type: 'riad',       city: 'Marrakech',   instagram: '@nelia.marrakech',                                    website: 'none',  priority: 'hot',  outreachAngle: '4 riads + spa + rooftop — serious business, Instagram-only (11K followers).',    source: 'Instagram' },
  { name: 'Mohamed Daif',               type: 'tour_guide', city: 'Marrakech',   phone: '+212 661 370 749',  email: 'daif996@gmail.com',             website: 'none',  priority: 'hot',  outreachAngle: 'WhatsApp + Gmail only. Offer landing page to capture bookings directly.',       source: 'Travel blog' },
  { name: 'Ismail Artisanat Marocain',  type: 'boutique',   city: 'Marrakech',   phone: '+212 681 910 784',  email: 'carverne.artisanat@gmail.com',  instagram: '@ismail_artisanat_marocain', website: 'none', priority: 'hot', outreachAngle: '13K Instagram followers, no website. Show TyyMaroc as proof.', source: 'Instagram' },
  { name: "Ma Déco d'Ailleurs",         type: 'boutique',   city: 'Marrakech',   instagram: '@madeco.dailleurs',                                   website: 'none',  priority: 'hot',  outreachAngle: '65K followers! B2B artisan supplier — no website is a huge missed opportunity.', source: 'Instagram' },
  { name: 'Boutique Artisanat Marrakech', type: 'boutique', city: 'Marrakech',   instagram: '@boutique_artisanat_marrakech',                        website: 'none',  priority: 'hot',  outreachAngle: 'Instagram-only artisan shop. Pitch e-commerce Starter package.',                source: 'Instagram' },
  { name: 'Hamsa Chaouen',              type: 'restaurant', city: 'Chefchaouen', instagram: '@hamsachaouen',                                       website: 'none',  priority: 'hot',  outreachAngle: 'Tea salon/restaurant Instagram-only. Pitch menu site + reservation form.',       source: 'Instagram' },
  // ── WARM: needs outreach ─────────────────────────────────────────────────
  { name: 'Riad Tizwa',                 type: 'riad',       city: 'Marrakech / Fes', email: 'Riadtizwa@gmail.com', instagram: '@riadtizwa',         website: 'none',  priority: 'warm', outreachAngle: 'Has Gmail — email directly. Two locations = needs a proper site.',              source: 'Search results' },
  { name: 'Riad Marrakech Doors',       type: 'riad',       city: 'Marrakech',   phone: '+212 524 378 637',  email: 'gm.riadmarrakechdoors@outlook.com', instagram: '@riad_marrakechdoors', website: 'none', priority: 'warm', outreachAngle: 'Has email + phone. Pitch Pro package — multi-room riad.', source: 'Search results' },
  { name: 'Riad Dar Saad',              type: 'riad',       city: 'Marrakech',   phone: '+212 524 378 562',  email: 'darsaadriad@gmail.com',         website: 'basic', priority: 'warm', outreachAngle: 'Basic site. Offer upgrade to Pro with booking dashboard.',                      source: 'Search results' },
  { name: 'Hamid Idbelaid',             type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '31 reviews on TourHQ — no own website. Offer personal landing page.',            source: 'TourHQ' },
  { name: 'Hassan Fadil',               type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '29 reviews. Pitch personal portfolio site to escape TourHQ commission.',         source: 'TourHQ' },
  { name: 'Abdelaziz (Aziz)',           type: 'tour_guide', city: 'Morocco',                                                                       website: 'none',  priority: 'warm', outreachAngle: '27 reviews. Nationwide guide — personal site = brand credibility.',              source: 'TourHQ' },
  { name: 'Houssaine Sliman',           type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'Mountain & desert specialist. Niche site = stand out from big operators.',        source: 'TourHQ' },
  { name: 'Noureddine Nour',            type: 'tour_guide', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'Freelance guide since 2005, speaks 5 languages. High-value prospect.',           source: 'TourHQ (MA55445)' },
  { name: 'Café Medina Rouge',          type: 'restaurant', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: '#279 on Tripadvisor with no website. Pitch Starter with booking form.',          source: 'Tripadvisor' },
  { name: 'Restaurant Médina Saveurs',  type: 'restaurant', city: 'Marrakech',                                                                     website: 'none',  priority: 'warm', outreachAngle: 'On Tripadvisor with no website. Easy sell — show menu + contact page.',          source: 'Tripadvisor' },
  { name: 'Café Restaurant Traditionnel', type: 'restaurant', city: 'Marrakech',                                                                   website: 'none',  priority: 'warm', outreachAngle: 'Traditional café on Tripadvisor with no website. Starter package is ideal.',     source: 'Tripadvisor' },
  { name: 'Artisanat et Décoration',    type: 'boutique',   city: 'Marrakech',   phone: '+212 657 595 760',  email: 'contact@artisanatetdecoration.com',               website: 'basic', priority: 'warm', outreachAngle: 'Has basic site. Pitch modern redesign + integrated online shop.', source: 'Search results' },
  { name: 'Moroccan Artisans',          type: 'boutique',   city: 'Morocco',     instagram: '@moroccartisans',                                     website: 'none',  priority: 'warm', outreachAngle: 'Large community account 10K+ followers. Instagram-only e-shop opportunity.',     source: 'Instagram' },
];

// ─── GET /api/leads — list all leads (admin only) ────────────────────────────
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, type, priority } = req.query;
    const where = {};
    if (status)   where.status   = status;
    if (type)     where.type     = type;
    if (priority) where.priority = priority;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, leads });
  } catch (err) { next(err); }
});

// ─── POST /api/leads/import — seed default leads (only if none exist) ─────────
router.post('/import', protect, authorize('admin'), async (req, res, next) => {
  try {
    const count = await prisma.lead.count();
    if (count > 0) {
      return res.json({ success: true, message: `Leads already imported (${count} exist).`, count });
    }
    await prisma.lead.createMany({ data: DEFAULT_LEADS });
    res.json({ success: true, message: `Imported ${DEFAULT_LEADS.length} leads.`, count: DEFAULT_LEADS.length });
  } catch (err) { next(err); }
});

// ─── POST /api/leads — create a lead ─────────────────────────────────────────
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, type, city, phone, email, instagram, website, priority, outreachAngle, source, notes } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
    const lead = await prisma.lead.create({
      data: { name, type: type || 'riad', city: city || '', phone, email, instagram, website, priority: priority || 'warm', outreachAngle, source, notes },
    });
    res.status(201).json({ success: true, lead });
  } catch (err) { next(err); }
});

// ─── PUT /api/leads/:id — update lead (status, notes, etc.) ──────────────────
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, notes, priority, email, phone, instagram } = req.body;
    const data = {};
    if (status    !== undefined) data.status    = status;
    if (notes     !== undefined) data.notes     = notes;
    if (priority  !== undefined) data.priority  = priority;
    if (email     !== undefined) data.email     = email;
    if (phone     !== undefined) data.phone     = phone;
    if (instagram !== undefined) data.instagram = instagram;

    const lead = await prisma.lead.update({ where: { id: req.params.id }, data });
    res.json({ success: true, lead });
  } catch (err) { next(err); }
});

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── POST /api/leads/:id/email — send outreach email ─────────────────────────
router.post('/:id/email', protect, authorize('admin'), async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    if (!lead.email) return res.status(400).json({ success: false, message: 'This lead has no email address.' });

    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ success: false, message: 'Subject and body are required.' });

    const result = await sendEmail({ to: lead.email, subject, html: body });

    if (result.sent) {
      await prisma.lead.update({
        where: { id: lead.id },
        data:  { status: 'emailed', emailSentAt: new Date() },
      });
    }

    res.json({ success: result.sent, result });
  } catch (err) { next(err); }
});

// ─── GET /api/leads/templates — return outreach templates ────────────────────
router.get('/templates', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { type = 'riad', name = 'your business' } = req.query;
    const tpl = templates.outreach({ name, type });
    res.json({ success: true, subject: tpl.subject, html: tpl.html });
  } catch (err) { next(err); }
});

module.exports = router;
