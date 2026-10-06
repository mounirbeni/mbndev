// SQL for migrate16.js (kept separate so it can be reviewed / run elsewhere).
const FK = (table) => `REFERENCES "${table}"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
module.exports = [
  `ALTER TABLE "ReviewBoosterAccount" ADD COLUMN IF NOT EXISTS "googleKeyEnc" TEXT`,
  `ALTER TABLE "ReviewBoosterAccount" ADD COLUMN IF NOT EXISTS "openaiKeyEnc" TEXT`,
  `ALTER TABLE "ReviewBusiness" ADD COLUMN IF NOT EXISTS "placeId" TEXT`,
  `ALTER TABLE "ReviewBusiness" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION`,
  `ALTER TABLE "ReviewBusiness" ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER`,
  `ALTER TABLE "ReviewBusiness" ADD COLUMN IF NOT EXISTS "monitoredAt" TIMESTAMP(3)`,
  `ALTER TABLE "ReviewBusiness" ADD COLUMN IF NOT EXISTS "monitorError" TEXT`,
  `CREATE TABLE IF NOT EXISTS "GoogleReview" (
    "id" TEXT PRIMARY KEY, "businessId" TEXT NOT NULL ${FK('ReviewBusiness')},
    "googleId" TEXT NOT NULL, "author" TEXT, "rating" INTEGER NOT NULL, "text" TEXT, "language" TEXT,
    "publishedAt" TIMESTAMP(3), "replyDraft" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "GoogleReview_businessId_googleId_key" ON "GoogleReview"("businessId", "googleId")`,
  `CREATE INDEX IF NOT EXISTS "GoogleReview_businessId_publishedAt_idx" ON "GoogleReview"("businessId", "publishedAt")`,
  `CREATE TABLE IF NOT EXISTS "ReviewSnapshot" (
    "id" TEXT PRIMARY KEY, "businessId" TEXT NOT NULL ${FK('ReviewBusiness')},
    "rating" DOUBLE PRECISION, "ratingCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "ReviewSnapshot_businessId_createdAt_idx" ON "ReviewSnapshot"("businessId", "createdAt")`,
];
