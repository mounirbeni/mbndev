// migrate5.js — add rejectionReason to Payment, protect price endpoint
// Run: node backend/prisma/migrate5.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate5] Adding rejectionReason to Payment...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Payment"
    ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT
  `);
  console.log('[migrate5] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
