'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientNameOverride" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientCompanyOverride" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientEmailOverride" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientPhoneOverride" TEXT`
  );
  console.log('Migration 8 complete: client override fields added to Project');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
