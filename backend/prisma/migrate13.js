// migrate13.js — MBN Local Growth tables (LocalGrowthAccount, LocalGrowthReport).
// Additive only. Run: node backend/prisma/migrate13.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "LocalGrowthAccount" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "reportMonth" TEXT NOT NULL DEFAULT '',
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "googleKeyEnc" TEXT,
    "openaiKeyEnc" TEXT,
    "brandName" TEXT,
    "brandUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "LocalGrowthReport" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "score" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "shareToken" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "LocalGrowthReport_userId_createdAt_idx" ON "LocalGrowthReport"("userId", "createdAt")`,
];

async function main() {
  console.log('[migrate13] Creating Local Growth tables...');
  for (const sql of STATEMENTS) await prisma.$executeRawUnsafe(sql);
  console.log('[migrate13] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
