// migrate7.js — add plan snapshot to Order (P1 audit fix: preserve the plan
// an order was priced under so a later edit can't silently reprice it
// under a null/current plan).
// Run: node backend/prisma/migrate7.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate7] Adding plan to Order...');
  // Nullable, no backfill — existing orders correctly have no recorded plan
  // (this preserves current updateOrder behavior for them: recalculate with
  // plan: null, exactly as before this fix).
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Order"
    ADD COLUMN IF NOT EXISTS "plan" TEXT
  `);
  console.log('[migrate7] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
