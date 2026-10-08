// SQL for migrate20.js (kept separate so it can be reviewed / run elsewhere).
module.exports = [
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "country" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Lead_country_idx" ON "Lead"("country")`,
];
