// migrate9.js — add shareTokenVersion to Project (P2 audit fix: makes
// project share links individually revocable instead of only expiring
// naturally after 90 days).
// Run: node backend/prisma/migrate9.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate9] Adding shareTokenVersion to Project...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Project"
    ADD COLUMN IF NOT EXISTS "shareTokenVersion" INTEGER NOT NULL DEFAULT 0
  `);
  console.log('[migrate9] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
