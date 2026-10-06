// migrate14.js — MBN Support AI tables. Additive only.
// Run: node backend/prisma/migrate14.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const STATEMENTS = require('./migrate14.sql.js');

async function main() {
  console.log('[migrate14] Creating Support AI tables...');
  for (const sql of STATEMENTS) await prisma.$executeRawUnsafe(sql);
  console.log('[migrate14] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
