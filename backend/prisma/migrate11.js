// migrate11.js — MBN Leads AI tables (LeadsAiAccount, Prospect).
// Additive only: two new tables, nothing existing changes.
// Run: node backend/prisma/migrate11.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate11] Creating Leads AI tables...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LeadsAiAccount" (
      "id"           TEXT PRIMARY KEY,
      "userId"       TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "plan"         TEXT NOT NULL DEFAULT 'starter',
      "searchMonth"  TEXT NOT NULL DEFAULT '',
      "searchCount"  INTEGER NOT NULL DEFAULT 0,
      "googleKeyEnc" TEXT,
      "openaiKeyEnc" TEXT,
      "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    TIMESTAMP(3) NOT NULL
    )`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Prospect" (
      "id"        TEXT PRIMARY KEY,
      "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "placeId"   TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "address"   TEXT,
      "phone"     TEXT,
      "website"   TEXT,
      "email"     TEXT,
      "rating"    DOUBLE PRECISION,
      "reviews"   INTEGER,
      "mapsUrl"   TEXT,
      "query"     TEXT,
      "score"     INTEGER NOT NULL DEFAULT 0,
      "audit"     JSONB,
      "message"   TEXT,
      "status"    TEXT NOT NULL DEFAULT 'new',
      "notes"     TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Prospect_userId_placeId_key" ON "Prospect"("userId", "placeId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Prospect_userId_status_idx" ON "Prospect"("userId", "status")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Prospect_userId_createdAt_idx" ON "Prospect"("userId", "createdAt")`);
  console.log('[migrate11] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
