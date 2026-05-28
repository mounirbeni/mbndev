// migrate6.js — fintech-grade payment hardening
// Adds: PaymentEvent table, AdminAuditLog table,
//       Payment columns: snapshotAmount, expiresAt, flaggedReason, riskScore,
//                        ipAddress, idempotencyKey
// Run: node backend/prisma/migrate6.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate6] Adding hardening columns to Payment...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment"
      ADD COLUMN IF NOT EXISTS "snapshotAmount"  DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "expiresAt"       TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "flaggedReason"   TEXT,
      ADD COLUMN IF NOT EXISTS "riskScore"       INTEGER,
      ADD COLUMN IF NOT EXISTS "ipAddress"       TEXT,
      ADD COLUMN IF NOT EXISTS "idempotencyKey"  TEXT
  `);

  console.log('[migrate6] Adding unique index on Payment.idempotencyKey...');
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key"
    ON "Payment"("idempotencyKey")
    WHERE "idempotencyKey" IS NOT NULL
  `);

  console.log('[migrate6] Adding index on Payment.externalRef...');
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Payment_externalRef_idx" ON "Payment"("externalRef")
  `);

  console.log('[migrate6] Adding index on Payment.expiresAt...');
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Payment_expiresAt_idx" ON "Payment"("expiresAt")
  `);

  console.log('[migrate6] Creating PaymentEvent table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PaymentEvent" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "paymentId"  TEXT NOT NULL,
      "actorId"    TEXT,
      "actorRole"  TEXT,
      "event"      TEXT NOT NULL,
      "fromStatus" TEXT,
      "toStatus"   TEXT NOT NULL,
      "note"       TEXT,
      "metadata"   JSONB,
      "ip"         TEXT,
      "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PaymentEvent_paymentId_fkey"
        FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PaymentEvent_paymentId_createdAt_idx"
    ON "PaymentEvent"("paymentId", "createdAt")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PaymentEvent_event_idx" ON "PaymentEvent"("event")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PaymentEvent_actorId_idx" ON "PaymentEvent"("actorId")
  `);

  console.log('[migrate6] Creating AdminAuditLog table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "adminId"    TEXT NOT NULL,
      "action"     TEXT NOT NULL,
      "targetType" TEXT NOT NULL,
      "targetId"   TEXT NOT NULL,
      "before"     JSONB,
      "after"      JSONB,
      "ip"         TEXT,
      "userAgent"  TEXT,
      "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AdminAuditLog_adminId_createdAt_idx"
    ON "AdminAuditLog"("adminId", "createdAt")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetType_targetId_idx"
    ON "AdminAuditLog"("targetType", "targetId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_createdAt_idx"
    ON "AdminAuditLog"("action", "createdAt")
  `);

  console.log('[migrate6] All done ✓');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
