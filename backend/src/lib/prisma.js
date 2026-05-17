'use strict';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

// Prisma 7+: the datasource URL is no longer read from schema.prisma at runtime.
// A PrismaPg adapter supplies the connection string to PrismaClient directly.
function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Singleton — prevents "too many connections" during nodemon hot-reload
const globalForPrisma = global;
const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
