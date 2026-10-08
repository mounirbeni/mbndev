// SQL for migrate19.js (kept separate so it can be reviewed / run elsewhere).
// lib/careers.js also runs these once per instance (all IF NOT EXISTS), so the
// feature works even before this script is run by hand.
module.exports = [
  `CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT PRIMARY KEY, "role" TEXT NOT NULL, "fullName" TEXT NOT NULL, "email" TEXT NOT NULL,
    "phone" TEXT, "location" TEXT, "experienceYears" TEXT NOT NULL, "availability" TEXT NOT NULL,
    "weeklyHours" TEXT, "expectedRate" TEXT, "portfolioUrl" TEXT, "linkedinUrl" TEXT,
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "answers" JSONB NOT NULL DEFAULT '{}',
    "message" TEXT, "cvUrl" TEXT NOT NULL, "cvName" TEXT NOT NULL, "cvSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new', "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "JobApplication_status_createdAt_idx" ON "JobApplication"("status", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "JobApplication_role_createdAt_idx" ON "JobApplication"("role", "createdAt")`,
];
