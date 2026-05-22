// Migration: add deletionRequestedAt column to User table
// Run: node prisma/migrate3.js

require('dotenv').config();
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set in .env');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('Connected to database.');

  try {
    await client.query(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP(3)
    `);
    console.log('Added deletionRequestedAt column to User table.');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
    console.log('Done.');
  }
}

run();
