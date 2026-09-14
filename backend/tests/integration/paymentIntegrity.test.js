'use strict';

// Integration tests against a REAL Postgres database — unlike tests/*.test.js
// (which deliberately avoid any DB dependency, see paymentGuardPure.js /
// authSecurityPure.js), these exercise the actual Prisma-level guarantees
// that the payment/order integrity fixes (P0-4) depend on: the optimistic
// row-lock pattern used by approveManualPayment, and the onDelete: Restrict
// relations that deleteUserCascade's manual ordering relies on.
//
// Run with: DATABASE_URL=postgres://... npm run test:integration
// Skipped automatically when DATABASE_URL is unset (e.g. local `npm test`,
// which must keep working with no DB configured).

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { Prisma } = require('@prisma/client');

const RUN  = !!process.env.DATABASE_URL;
const skip = RUN ? false : 'DATABASE_URL not set — skipping DB integration tests';

let prisma;
const createdUserIds = [];

before(() => {
  if (RUN) prisma = require('../../src/lib/prisma');
});

after(async () => {
  if (!RUN) return;
  // Best-effort cleanup in FK-safe order: payments -> orders -> users.
  for (const userId of createdUserIds) {
    await prisma.payment.deleteMany({ where: { clientId: userId } }).catch(() => {});
    await prisma.order.deleteMany({ where: { clientId: userId } }).catch(() => {});
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

async function makeClient(suffix) {
  const user = await prisma.user.create({
    data: {
      name:     'Integration Test Client',
      email:    `integration-test-${suffix}-${Date.now()}@example.invalid`,
      password: 'not-a-real-hash',
      role:     'client',
    },
  });
  createdUserIds.push(user.id);
  return user;
}

test('concurrent approve requests: only one wins the pending_verification -> processing lock', { skip }, async () => {
  const user = await makeClient('race');
  const order = await prisma.order.create({
    data: {
      clientId:    user.id,
      serviceType: 'website',
      title:       'Race condition test order',
      totalPrice:  500,
      status:      'pending',
    },
  });
  const payment = await prisma.payment.create({
    data: {
      clientId: user.id,
      orderId:  order.id,
      amount:   500,
      status:   'pending_verification',
      method:   'cih_bank',
    },
  });

  // Simulate two admins clicking "approve" on the same payment at the same
  // instant — this is exactly the race approveManualPayment's optimistic
  // lock (updateMany scoped by the expected CURRENT status) must prevent.
  const [a, b] = await Promise.all([
    prisma.payment.updateMany({ where: { id: payment.id, status: 'pending_verification' }, data: { status: 'processing' } }),
    prisma.payment.updateMany({ where: { id: payment.id, status: 'pending_verification' }, data: { status: 'processing' } }),
  ]);

  assert.equal(a.count + b.count, 1, 'exactly one of the two concurrent approvals must win the lock');

  const final = await prisma.payment.findUnique({ where: { id: payment.id }, select: { status: true } });
  assert.equal(final.status, 'processing');
});

test('deleting a user with an active order is rejected (onDelete: Restrict)', { skip }, async () => {
  const user = await makeClient('restrict');
  const order = await prisma.order.create({
    data: {
      clientId:    user.id,
      serviceType: 'website',
      title:       'Restrict test order',
      totalPrice:  250,
      status:      'pending',
    },
  });

  // deleteUserCascade (routes/admin.js) depends on the Order->User relation
  // being Restrict, not Cascade — it deletes Orders BEFORE the User row
  // precisely because a direct User delete must fail here. If this relation
  // were ever accidentally loosened to Cascade, this assertion would catch
  // it: the delete would silently succeed instead of being rejected.
  await assert.rejects(
    () => prisma.user.delete({ where: { id: user.id } }),
    (err) => {
      // Prisma's foreign-key-violation error is P2003 (occasionally P2014
      // for required-relation violations depending on how the constraint is
      // modeled); fall back to a message match in case that ever shifts.
      return err.code === 'P2003' || err.code === 'P2014'
        || /foreign key|constraint/i.test(err.message || '');
    },
  );

  // Clean up in the correct order so `after()`'s cleanup doesn't also fail.
  await prisma.order.delete({ where: { id: order.id } });
});

test('two concurrent submissions with the same idempotency key: one wins, the loser sees P2002 (not P2034)', { skip }, async () => {
  const user = await makeClient('idem');
  const orderA = await prisma.order.create({
    data: { clientId: user.id, serviceType: 'website', title: 'Idempotency test order A', totalPrice: 300, status: 'pending' },
  });
  const orderB = await prisma.order.create({
    data: { clientId: user.id, serviceType: 'website', title: 'Idempotency test order B', totalPrice: 300, status: 'pending' },
  });
  const key = `idem-key-${Date.now()}`;

  // Mirrors submitManualPayment's step 5 transaction shape (Serializable +
  // an insert on a column with a @unique constraint) closely enough to
  // confirm which Prisma error code a same-key race actually raises. Two
  // DIFFERENT orders on purpose — the interesting race is on the
  // idempotencyKey unique constraint itself, not the per-order duplicate
  // guard (which uses a separate findFirst check, already covered above).
  const attempt = (orderId) => prisma.$transaction(async (tx) => {
    return tx.payment.create({
      data: {
        clientId: user.id,
        orderId,
        amount:   300,
        status:   'pending_verification',
        method:   'cih_bank',
        idempotencyKey: key,
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10_000 });

  const results = await Promise.allSettled([attempt(orderA.id), attempt(orderB.id)]);
  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected  = results.filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1, 'exactly one insert should succeed');
  assert.equal(rejected.length, 1, 'exactly one insert should fail on the unique constraint');
  // This is the assumption submitManualPayment's P2002 handler depends on —
  // if Prisma ever raised something else here (e.g. P2034 from the
  // Serializable isolation level swallowing the unique-constraint race
  // instead), that handler would silently stop catching this case and the
  // loser would get a raw 500 again.
  assert.equal(rejected[0].reason.code, 'P2002');
});
