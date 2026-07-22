// migrate7.js — installment payment support
// Adds: Project.isInstallment column
// Run: node backend/prisma/migrate7.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate7] Adding isInstallment to Project...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Project"
      ADD COLUMN IF NOT EXISTS "isInstallment" BOOLEAN NOT NULL DEFAULT false
  `);

  console.log('[migrate7] All done ✓');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
