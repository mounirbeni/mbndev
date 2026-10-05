// migrate10.js — add discountPct to Order (personal random offers, see
// src/lib/offers.js). Nullable: existing orders had no offer.
// Run: node backend/prisma/migrate10.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate10] Adding discountPct to Order...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Order"
    ADD COLUMN IF NOT EXISTS "discountPct" INTEGER
  `);
  console.log('[migrate10] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
