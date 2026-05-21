// One-time migration script for account integrity changes
// Run: node prisma/migrate.js
//
// Changes applied:
//   1. Make User.phone nullable (set empty strings to NULL)
//   2. Add unique index on User.phone (excluding NULLs automatically in PG)
//   3. Create LoginAttempt table for brute-force tracking

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
    // 1. Make phone nullable FIRST (before nullifying values)
    await client.query(`
      ALTER TABLE "User" ALTER COLUMN phone DROP NOT NULL
    `).catch(() => { /* already nullable */ });
    console.log('phone column: set nullable');

    // 2. Drop old default on phone
    await client.query(`
      ALTER TABLE "User" ALTER COLUMN phone DROP DEFAULT
    `).catch(() => {});
    console.log('phone column: dropped default');

    // 3. Nullify empty phone strings (now safe since column is nullable)
    const { rowCount: cleared } = await client.query(`
      UPDATE "User" SET phone = NULL WHERE phone = '' OR phone = ' ' OR phone IS NOT DISTINCT FROM ''
    `);
    console.log(`Cleared ${cleared} empty phone values → NULL`);

    // 4. Add unique index (partial — allows multiple NULLs in PostgreSQL by design)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"(phone)
    `);
    console.log('phone column: unique index created');

    // 5. Create LoginAttempt table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "LoginAttempt" (
        id         TEXT        NOT NULL DEFAULT gen_random_uuid(),
        email      TEXT        NOT NULL,
        ip         TEXT,
        success    BOOLEAN     NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id)
      )
    `);
    console.log('LoginAttempt table: created');

    // 6. Indexes on LoginAttempt
    await client.query(`
      CREATE INDEX IF NOT EXISTS "LoginAttempt_email_createdAt_idx"
        ON "LoginAttempt"(email, "createdAt")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "LoginAttempt_ip_createdAt_idx"
        ON "LoginAttempt"(ip, "createdAt")
    `);
    console.log('LoginAttempt indexes: created');

    console.log('\nMigration complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
