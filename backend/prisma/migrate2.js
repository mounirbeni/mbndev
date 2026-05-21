// Migration 2 — apply schema changes that were never pushed to the live DB
// Run: node prisma/migrate2.js
//
// Changes:
//   1. Add User.passwordChangedAt (nullable TIMESTAMPTZ) — JWT invalidation field
//   2. Add performance indexes on User, Project, Payment, Message models

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
  console.log('Connected to database.\n');

  try {

    // ── 1. passwordChangedAt column ─────────────────────────────────────────
    await client.query(`
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMPTZ NULL
    `);
    console.log('User.passwordChangedAt: column added (nullable)');

    // ── 2. User indexes ──────────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS "User_email_idx"
        ON "User"(email)
    `);
    console.log('Index created: User_email_idx');

    await client.query(`
      CREATE INDEX IF NOT EXISTS "User_role_isActive_idx"
        ON "User"(role, "isActive")
    `);
    console.log('Index created: User_role_isActive_idx');

    await client.query(`
      CREATE INDEX IF NOT EXISTS "User_createdAt_idx"
        ON "User"("createdAt")
    `);
    console.log('Index created: User_createdAt_idx');

    // ── 3. Project indexes ───────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Project_clientId_createdAt_idx"
        ON "Project"("clientId", "createdAt")
    `);
    console.log('Index created: Project_clientId_createdAt_idx');

    await client.query(`
      CREATE INDEX IF NOT EXISTS "Project_status_createdAt_idx"
        ON "Project"(status, "createdAt")
    `);
    console.log('Index created: Project_status_createdAt_idx');

    // ── 4. Payment indexes ───────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Payment_clientId_status_idx"
        ON "Payment"("clientId", status)
    `);
    console.log('Index created: Payment_clientId_status_idx');

    await client.query(`
      CREATE INDEX IF NOT EXISTS "Payment_status_createdAt_idx"
        ON "Payment"(status, "createdAt")
    `);
    console.log('Index created: Payment_status_createdAt_idx');

    // ── 5. Message indexes ───────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Message_projectId_createdAt_idx"
        ON "Message"("projectId", "createdAt")
    `);
    console.log('Index created: Message_projectId_createdAt_idx');

    await client.query(`
      CREATE INDEX IF NOT EXISTS "Message_isRead_senderId_idx"
        ON "Message"("isRead", "senderId")
    `);
    console.log('Index created: Message_isRead_senderId_idx');

    console.log('\nMigration 2 complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
