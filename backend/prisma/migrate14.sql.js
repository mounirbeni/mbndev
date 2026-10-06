// SQL for migrate14.js (kept separate so it can be reviewed / run elsewhere).
const FK = (table) => `REFERENCES "${table}"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
module.exports = [
  `CREATE TABLE IF NOT EXISTS "SupportAiAccount" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE ${FK('User')},
    "plan" TEXT NOT NULL DEFAULT 'starter', "messageMonth" TEXT NOT NULL DEFAULT '',
    "messageCount" INTEGER NOT NULL DEFAULT 0, "openaiKeyEnc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "SupportBot" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL ${FK('User')},
    "name" TEXT NOT NULL, "websiteUrl" TEXT NOT NULL,
    "welcome" TEXT NOT NULL DEFAULT 'Hi! How can I help you today?', "color" TEXT NOT NULL DEFAULT '#7c3aed',
    "allowedDomains" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "handoffWhatsapp" TEXT, "handoffEmail" TEXT,
    "notes" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "pageCount" INTEGER NOT NULL DEFAULT 0,
    "trainedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "SupportBot_userId_idx" ON "SupportBot"("userId")`,
  `CREATE TABLE IF NOT EXISTS "SupportChunk" (
    "id" TEXT PRIMARY KEY, "botId" TEXT NOT NULL ${FK('SupportBot')},
    "url" TEXT NOT NULL, "title" TEXT, "text" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "SupportChunk_botId_idx" ON "SupportChunk"("botId")`,
  `CREATE TABLE IF NOT EXISTS "SupportConversation" (
    "id" TEXT PRIMARY KEY, "botId" TEXT NOT NULL ${FK('SupportBot')},
    "visitorId" TEXT NOT NULL, "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "SupportConversation_botId_updatedAt_idx" ON "SupportConversation"("botId", "updatedAt")`,
  `CREATE TABLE IF NOT EXISTS "SupportLead" (
    "id" TEXT PRIMARY KEY, "botId" TEXT NOT NULL ${FK('SupportBot')},
    "conversationId" TEXT, "name" TEXT, "email" TEXT, "phone" TEXT, "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "SupportLead_botId_createdAt_idx" ON "SupportLead"("botId", "createdAt")`,
];
