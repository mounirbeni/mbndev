'use strict';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

// ─── Connection pool configuration ───────────────────────────────────────────
// Vercel serverless: each function instance gets its own pool. Keep it small
// (2-3) so we don't exhaust Neon's connection limit across many instances.
// Long-lived Node servers can use a larger pool (default 10).
const POOL_SIZE = process.env.NODE_ENV === 'production'
  ? parseInt(process.env.DB_POOL_SIZE || '3', 10)
  : parseInt(process.env.DB_POOL_SIZE || '5', 10);

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[prisma] DATABASE_URL is not set');
  }

  // pg Pool options are passed in the connection string or via adapter options.
  // PrismaPg accepts a pool config object as the second argument.
  const adapter = new PrismaPg(
    { connectionString },
    { pool: { max: POOL_SIZE } }
  );

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? [
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
          // Uncomment to log slow queries in dev:
          // { emit: 'event', level: 'query' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
    // Global query timeout: 25 s (Vercel function timeout is 30 s)
    // Individual controllers can use shorter timeouts via prisma.$transaction options.
    transactionOptions: {
      timeout:     25_000,
      maxWait:      5_000,
      isolationLevel: 'ReadCommitted',
    },
  });
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Prevents "too many PrismaClient instances" warning during hot-reload in dev.
const globalForPrisma = global;
const prisma = globalForPrisma.__prisma__ ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma__ = prisma;

module.exports = prisma;
