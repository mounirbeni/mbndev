const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const {
  validPin, isLive, stateOf, publicConfig, adminView, parsePatch, toColumns, catalogEntry, CATALOG,
} = require('../src/lib/demos');

const row = (o = {}) => ({
  slug: 'coffee', name: 'NOUR', enabled: true, pinHash: 'x', publicPin: '2468', expiresAt: null, notes: null,
  unlocks: 0, lastUnlockAt: null, updatedAt: new Date(), ...o,
});

test('PIN must be 4 to 8 digits', () => {
  for (const ok of ['2468', '123456', '12345678']) assert.ok(validPin(ok), ok);
  for (const bad of ['', '123', '123456789', '12a4', ' 1234', 1234, null, undefined]) assert.ok(!validPin(bad), String(bad));
});

test('live only when enabled and not expired', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  assert.equal(isLive(row(), now), true);
  assert.equal(isLive(row({ enabled: false }), now), false);
  assert.equal(isLive(row({ expiresAt: new Date('2026-05-31T00:00:00Z') }), now), false);
  assert.equal(isLive(row({ expiresAt: new Date('2026-06-02T00:00:00Z') }), now), true);
  assert.equal(stateOf(row({ enabled: false })), 'disabled');
  assert.equal(stateOf(row({ expiresAt: new Date(0) })), 'expired');
});

test('public config exposes the PIN only while it is shown, and never the hash', () => {
  assert.equal(publicConfig(row()).pinHint, '2468');
  assert.equal(publicConfig(row({ publicPin: null })).pinHint, null);
  assert.ok(!('pinHash' in publicConfig(row())));
  assert.ok(!('pinHash' in adminView(row(), catalogEntry('coffee'))));
});

test('parsePatch validates every field', () => {
  const cur = row({ publicPin: null });
  assert.ok(parsePatch({ pin: '12' }, cur).error);
  assert.ok(parsePatch({ enabled: 'yes' }, cur).error);
  assert.ok(parsePatch({ name: '   ' }, cur).error);
  assert.ok(parsePatch({ expiresAt: 'not a date' }, cur).error);
  assert.ok(parsePatch({ notes: 'x'.repeat(1001) }, cur).error);
  assert.ok(parsePatch({ showPin: true }, cur).error, 'cannot show a PIN that is only stored hashed');
  assert.equal(parsePatch({ showPin: true, pin: '1357' }, cur).error, undefined);
  assert.equal(parsePatch({ showPin: true }, row()).error, undefined, 'already public → can stay public');
  assert.equal(parsePatch({ expiresAt: '' }, cur).data.expiresAt, null);
  assert.equal(parsePatch({ notes: '  hi ' }, cur).data.notes, 'hi');
});

test('toColumns hashes the PIN and keeps the gate in sync', async () => {
  const hidden = await toColumns({ pin: '1357' }, row({ publicPin: null }));
  assert.ok(await bcrypt.compare('1357', hidden.pinHash));
  assert.equal(hidden.publicPin, null, 'a hidden PIN stays hidden');

  const shown = await toColumns({ pin: '1357' }, row({ publicPin: '2468' }));
  assert.equal(shown.publicPin, '1357', 'changing a public PIN replaces the one on the gate');

  const hide = await toColumns({ showPin: false }, row());
  assert.equal(hide.publicPin, null);
  assert.equal(hide.pinHash, undefined);

  const show = await toColumns({ showPin: true, pin: '9999' }, row({ publicPin: null }));
  assert.equal(show.publicPin, '9999');

  assert.deepEqual(await toColumns({ enabled: false }, row()), { enabled: false });
});

test('catalog entries are well-formed', () => {
  for (const d of CATALOG) {
    assert.ok(validPin(d.defaultPin));
    assert.ok(d.path.startsWith('/demo/') && d.adminPath.startsWith(d.path));
  }
});

test('unlock endpoint: wrong PIN, right PIN, disabled', async () => {
  const hash = await bcrypt.hash('2468', 4);
  let state = row({ pinHash: hash });
  const updates = [];
  const prismaPath = require.resolve('../src/lib/prisma');
  require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: {
    $executeRawUnsafe: async () => 0,
    demoSite: {
      findUnique: async () => state,
      update: async (a) => { updates.push(a); return state; },
    },
  } };
  delete require.cache[require.resolve('../src/controllers/demoController')];
  const { unlock } = require('../src/controllers/demoController');
  const call = async (pin) => {
    const out = {};
    const res = { set() {}, status(c) { out.code = c; return this; }, json(b) { out.body = b; return this; } };
    await unlock({ params: { slug: 'coffee' }, body: { pin } }, res, (e) => { throw e; });
    return out;
  };
  assert.equal((await call('0000')).code, 401);
  assert.equal((await call(undefined)).code, 401);
  assert.equal((await call('2468')).body.success, true);
  assert.equal(updates.length, 1);
  state = row({ pinHash: hash, enabled: false });
  assert.equal((await call('2468')).code, 403);
  assert.equal(updates.length, 1, 'no unlock is counted for a disabled demo');
  delete require.cache[prismaPath];
});
