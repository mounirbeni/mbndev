// migrate12.js — Order.product: software product orders ("leads-ai:pro").
// Nullable: every existing order is a project order (null).
// Run: node backend/prisma/migrate12.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate12] Adding product to Order...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "product" TEXT`);
  console.log('[migrate12] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
