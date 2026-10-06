// SQL for migrate15.js (kept separate so it can be reviewed / run elsewhere).
const FK = (table) => `REFERENCES "${table}"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
module.exports = [
  `CREATE TABLE IF NOT EXISTS "ReviewBoosterAccount" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE ${FK('User')},
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "ReviewBusiness" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL ${FK('User')},
    "name" TEXT NOT NULL, "googleReviewUrl" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7c3aed', "language" TEXT NOT NULL DEFAULT 'en',
    "active" BOOLEAN NOT NULL DEFAULT true, "views" INTEGER NOT NULL DEFAULT 0,
    "googleClicks" INTEGER NOT NULL DEFAULT 0, "requestsSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "ReviewBusiness_userId_idx" ON "ReviewBusiness"("userId")`,
  `CREATE TABLE IF NOT EXISTS "ReviewFeedback" (
    "id" TEXT PRIMARY KEY, "businessId" TEXT NOT NULL ${FK('ReviewBusiness')},
    "rating" INTEGER, "message" TEXT NOT NULL, "name" TEXT, "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "ReviewFeedback_businessId_createdAt_idx" ON "ReviewFeedback"("businessId", "createdAt")`,
];
