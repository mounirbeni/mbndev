'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { logAdminAction, getClientIp } = require('../lib/paymentAudit');
const {
  CATALOG, catalogEntry, isLive, publicConfig, adminView, parsePatch, toColumns, getOrCreate,
} = require('../lib/demos');

// ─── Public: called by the static demo pages ─────────────────────────────────

exports.config = async (req, res, next) => {
  try {
    const row = await getOrCreate(prisma, req.params.slug);
    if (!row) return res.status(404).json({ success: false, message: 'Unknown demo.' });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, ...publicConfig(row) });
  } catch (err) { next(err); }
};

exports.unlock = async (req, res, next) => {
  try {
    const row = await getOrCreate(prisma, req.params.slug);
    if (!row) return res.status(404).json({ success: false, message: 'Unknown demo.' });
    if (!isLive(row)) return res.status(403).json({ success: false, code: 'unavailable', message: 'This demo is not available right now.' });

    const pin = typeof req.body?.pin === 'string' ? req.body.pin : '';
    const ok = pin.length > 0 && pin.length <= 32 && await bcrypt.compare(pin, row.pinHash);
    if (!ok) return res.status(401).json({ success: false, message: 'Wrong PIN.' });

    await prisma.demoSite.update({ where: { slug: row.slug }, data: { unlocks: { increment: 1 }, lastUnlockAt: new Date() } });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── Admin ───────────────────────────────────────────────────────────────────

exports.list = async (_req, res, next) => {
  try {
    const rows = await Promise.all(CATALOG.map((d) => getOrCreate(prisma, d.slug)));
    res.json({ success: true, demos: rows.map((r) => adminView(r, catalogEntry(r.slug))) });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const current = await getOrCreate(prisma, req.params.slug);
    if (!current) return res.status(404).json({ success: false, message: 'Unknown demo.' });

    const { data, error } = parsePatch(req.body, current);
    if (error) return res.status(400).json({ success: false, message: error });

    const cols = await toColumns(data, current);
    if (!Object.keys(cols).length) return res.status(400).json({ success: false, message: 'Nothing to change.' });

    const row = await prisma.demoSite.update({ where: { slug: current.slug }, data: cols });

    // The PIN itself is never written to the audit log.
    await logAdminAction({
      adminId: req.user.id, action: 'update_demo', targetType: 'demo', targetId: current.slug,
      before: { enabled: current.enabled, expiresAt: current.expiresAt, shownOnGate: Boolean(current.publicPin) },
      after:  { enabled: row.enabled, expiresAt: row.expiresAt, shownOnGate: Boolean(row.publicPin), pinChanged: Boolean(data.pin) },
      ip: getClientIp(req), userAgent: req.headers['user-agent'] || null,
    });

    res.json({ success: true, demo: adminView(row, catalogEntry(row.slug)) });
  } catch (err) { next(err); }
};
