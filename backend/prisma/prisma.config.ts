import { defineConfig } from 'prisma/config';

// Prisma 7+: datasource URL is no longer declared in schema.prisma.
// This file is used by the Prisma CLI (migrate, generate, db push, studio).
// The runtime client uses DATABASE_URL via @prisma/adapter-pg (see src/lib/prisma.js).
export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
});
