// SQL for migrate17.js (kept separate so it can be reviewed / run elsewhere).
const FK = (table) => `REFERENCES "${table}"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
module.exports = [
  `CREATE TABLE IF NOT EXISTS "ProposalAccount" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE ${FK('User')},
    "plan" TEXT NOT NULL DEFAULT 'starter', "proposalMonth" TEXT NOT NULL DEFAULT '',
    "proposalCount" INTEGER NOT NULL DEFAULT 0, "openaiKeyEnc" TEXT,
    "brandName" TEXT, "brandColor" TEXT NOT NULL DEFAULT '#7c3aed', "brandEmail" TEXT, "brandWebsite" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Proposal" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL ${FK('User')},
    "title" TEXT NOT NULL, "clientName" TEXT NOT NULL, "clientCompany" TEXT, "clientEmail" TEXT, "clientPhone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en', "currency" TEXT NOT NULL DEFAULT 'USD',
    "content" JSONB NOT NULL, "items" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft', "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT NOT NULL UNIQUE, "validUntil" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0, "firstViewedAt" TIMESTAMP(3), "lastViewedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3), "followUpSentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3), "acceptedName" TEXT, "acceptedItems" JSONB, "acceptedTotal" DOUBLE PRECISION,
    "declinedAt" TIMESTAMP(3), "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "Proposal_userId_updatedAt_idx" ON "Proposal"("userId", "updatedAt")`,
  `CREATE INDEX IF NOT EXISTS "Proposal_status_sentAt_idx" ON "Proposal"("status", "sentAt")`,
];
