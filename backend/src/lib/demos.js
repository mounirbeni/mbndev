'use strict';

/**
 * Demo sites manager — pure helpers + lazy DB access.
 *
 * The demos under frontend/public/demos/* are static pages. What the owner can
 * control from the dashboard (PIN, on/off, expiry, whether the PIN is shown on
 * the login screen) is stored in the DemoSite table and enforced through the
 * public /api/demos/:slug routes the demo pages call.
 */

const bcrypt = require('bcryptjs');

// Add a demo here (and ship its static files) to make it appear in the dashboard.
const CATALOG = [
  { slug: 'coffee', name: 'NOUR Coffee Atelier', path: '/demo/coffee', adminPath: '/demo/coffee/admin', defaultPin: '2468' },
  { slug: 'barber', name: 'TARZ Barber Club', path: '/demo/barber', adminPath: '/demo/barber/admin', defaultPin: '1357' },
  { slug: 'beauty', name: 'LALLA Beauty House', path: '/demo/beauty', adminPath: '/demo/beauty/admin', defaultPin: '2580' },
  { slug: 'law', name: 'Cabinet Alaoui (solo lawyer)', path: '/demo/law', adminPath: '/demo/law/admin', defaultPin: '4821' },
];

const catalogEntry = (slug) => CATALOG.find((d) => d.slug === slug) || null;

const PIN_RE = /^\d{4,8}$/;
const validPin = (pin) => typeof pin === 'string' && PIN_RE.test(pin);

/** A demo is reachable when switched on and not past its expiry date. */
function isLive(row, now = new Date()) {
  if (!row) return false;
  if (!row.enabled) return false;
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= now.getTime()) return false;
  return true;
}

function stateOf(row, now = new Date()) {
  if (!row.enabled) return 'disabled';
  if (row.expiresAt && new Date(row.expiresAt).getTime() <= now.getTime()) return 'expired';
  return 'live';
}

/** What a visitor of the demo may know. The PIN is exposed only while "show on gate" is on. */
const publicConfig = (row, now = new Date()) => ({
  live: isLive(row, now),
  state: stateOf(row, now),
  name: row.name,
  pinHint: row.publicPin || null,
});

/** What the owner sees in the dashboard (never the hash). */
const adminView = (row, entry, now = new Date()) => ({
  slug: row.slug,
  name: row.name,
  path: entry?.path ?? `/demo/${row.slug}`,
  adminPath: entry?.adminPath ?? `/demo/${row.slug}/admin`,
  enabled: row.enabled,
  state: stateOf(row, now),
  showPin: Boolean(row.publicPin),
  pin: row.publicPin || null,
  expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
  notes: row.notes || '',
  unlocks: row.unlocks,
  lastUnlockAt: row.lastUnlockAt ? new Date(row.lastUnlockAt).toISOString() : null,
  updatedAt: new Date(row.updatedAt).toISOString(),
});

/**
 * Validate an owner PATCH. `current` is the stored row (used for the show-PIN rule).
 * Returns { data } with Prisma-ready fields (plain `pin` is converted by the caller) or { error }.
 */
function parsePatch(body, current) {
  const b = body && typeof body === 'object' ? body : {};
  const out = {};

  if (b.name !== undefined) {
    const name = String(b.name).trim();
    if (!name || name.length > 80) return { error: 'Name must be 1–80 characters.' };
    out.name = name;
  }
  if (b.enabled !== undefined) {
    if (typeof b.enabled !== 'boolean') return { error: 'enabled must be true or false.' };
    out.enabled = b.enabled;
  }
  if (b.pin !== undefined && b.pin !== null && b.pin !== '') {
    if (!validPin(b.pin)) return { error: 'The PIN must be 4 to 8 digits.' };
    out.pin = b.pin;
  }
  if (b.showPin !== undefined) {
    if (typeof b.showPin !== 'boolean') return { error: 'showPin must be true or false.' };
    out.showPin = b.showPin;
    // The PIN is stored hashed, so showing it needs the plain value in the same request.
    if (b.showPin && !out.pin && !current.publicPin) return { error: 'Enter the PIN again to show it on the login screen.' };
  }
  if (b.expiresAt !== undefined) {
    if (b.expiresAt === null || b.expiresAt === '') out.expiresAt = null;
    else {
      const d = new Date(b.expiresAt);
      if (Number.isNaN(d.getTime())) return { error: 'Expiry date is not valid.' };
      out.expiresAt = d;
    }
  }
  if (b.notes !== undefined) {
    const notes = String(b.notes ?? '').trim();
    if (notes.length > 1000) return { error: 'Notes are limited to 1000 characters.' };
    out.notes = notes || null;
  }
  return { data: out };
}

/** Turn a validated patch into the columns to write (hashing the PIN). */
async function toColumns(patch, current) {
  const cols = {};
  if (patch.name !== undefined) cols.name = patch.name;
  if (patch.enabled !== undefined) cols.enabled = patch.enabled;
  if (patch.expiresAt !== undefined) cols.expiresAt = patch.expiresAt;
  if (patch.notes !== undefined) cols.notes = patch.notes;
  if (patch.pin) cols.pinHash = await bcrypt.hash(patch.pin, 10);
  const showPin = patch.showPin !== undefined ? patch.showPin : Boolean(current.publicPin);
  if (patch.showPin !== undefined || patch.pin) {
    // Changing the PIN while it is public must not leave the old one on the gate.
    cols.publicPin = showPin ? (patch.pin || current.publicPin) : null;
  }
  return cols;
}

// ─── DB access ───────────────────────────────────────────────────────────────

let ensured = null;
function ensureTable(prisma) {
  if (!ensured) {
    const statements = require('../../prisma/migrate21.sql.js');
    ensured = (async () => { for (const sql of statements) await prisma.$executeRawUnsafe(sql); })()
      .catch((err) => { ensured = null; throw err; });
  }
  return ensured;
}

/** Row for a catalog demo, created with its default PIN on first use. */
async function getOrCreate(prisma, slug) {
  const entry = catalogEntry(slug);
  if (!entry) return null;
  await ensureTable(prisma);
  const found = await prisma.demoSite.findUnique({ where: { slug } });
  if (found) return found;
  try {
    return await prisma.demoSite.create({
      data: { slug, name: entry.name, pinHash: await bcrypt.hash(entry.defaultPin, 10), publicPin: entry.defaultPin },
    });
  } catch (err) {
    if (err.code === 'P2002') return prisma.demoSite.findUnique({ where: { slug } }); // lost a race
    throw err;
  }
}

module.exports = {
  CATALOG, catalogEntry, validPin, isLive, stateOf, publicConfig, adminView, parsePatch, toColumns, ensureTable, getOrCreate,
};
