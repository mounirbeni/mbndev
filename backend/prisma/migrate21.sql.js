// SQL for migrate21.js (kept separate so it can be reviewed / run elsewhere).
// lib/demos.js also runs these once per instance (all IF NOT EXISTS), so the
// feature works even before this script is run by hand. Additive only.
module.exports = [
  `CREATE TABLE IF NOT EXISTS "DemoSite" (
    "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true, "pinHash" TEXT NOT NULL, "publicPin" TEXT,
    "expiresAt" TIMESTAMP(3), "notes" TEXT, "unlocks" INTEGER NOT NULL DEFAULT 0, "lastUnlockAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "DemoSite_slug_key" ON "DemoSite"("slug")`,
];
