import { defineConfig } from 'prisma/config';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Prisma 7+: datasource URL is no longer declared in schema.prisma.
// Load .env from the backend root so the CLI can resolve DATABASE_URL.
loadEnv({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
});
