// migrate19.js — Careers job applications table. Additive only.
// Run: node backend/prisma/migrate19.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const STATEMENTS = require('./migrate19.sql.js');

async function main() {
  console.log('[migrate19] Creating JobApplication table...');
  for (const sql of STATEMENTS) await prisma.$executeRawUnsafe(sql);
  console.log('[migrate19] Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
