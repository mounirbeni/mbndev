// migrate8.js — add missing indexes on hot query paths (P2 audit fix)
// Order.clientId/status, Milestone.projectId, ProjectFile.projectId/uploadedById,
// Notification.userId, ActivityLog.projectId/userId were all filtered on
// without a supporting index, forcing sequential scans as each table grows.
// Run: node backend/prisma/migrate8.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('[migrate8] Adding missing indexes...');

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Order_clientId_createdAt_idx"
    ON "Order"("clientId", "createdAt")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx"
    ON "Order"("status", "createdAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Milestone_projectId_idx"
    ON "Milestone"("projectId")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProjectFile_projectId_idx"
    ON "ProjectFile"("projectId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProjectFile_uploadedById_idx"
    ON "ProjectFile"("uploadedById")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx"
    ON "Notification"("userId", "read")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx"
    ON "Notification"("userId", "createdAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_projectId_createdAt_idx"
    ON "ActivityLog"("projectId", "createdAt")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_userId_createdAt_idx"
    ON "ActivityLog"("userId", "createdAt")
  `);

  console.log('[migrate8] All done ✓');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
