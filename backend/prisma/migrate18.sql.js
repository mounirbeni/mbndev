// SQL for migrate18.js (kept separate so it can be reviewed / run elsewhere).
const FK = (table) => `REFERENCES "${table}"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
module.exports = [
  `CREATE TABLE IF NOT EXISTS "MenuAccount" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE ${FK('User')},
    "plan" TEXT NOT NULL DEFAULT 'starter', "openaiKeyEnc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "MenuRestaurant" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL ${FK('User')},
    "name" TEXT NOT NULL, "tagline" JSONB NOT NULL DEFAULT '{}', "about" JSONB NOT NULL DEFAULT '{}',
    "color" TEXT NOT NULL DEFAULT '#1f4fd1',
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'EUR', "timezone" TEXT NOT NULL DEFAULT 'Europe/Lisbon',
    "address" TEXT, "phone" TEXT, "whatsapp" TEXT, "email" TEXT, "instagram" TEXT, "website" TEXT,
    "wifiName" TEXT, "wifiPassword" TEXT, "logoPhotoId" TEXT, "coverPhotoId" TEXT,
    "hours" JSONB NOT NULL DEFAULT '{}', "payments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "ordering" BOOLEAN NOT NULL DEFAULT true, "booking" BOOLEAN NOT NULL DEFAULT true,
    "waiterCall" BOOLEAN NOT NULL DEFAULT true, "coverCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "menu" JSONB NOT NULL DEFAULT '{"categories":[]}', "active" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "MenuRestaurant_userId_idx" ON "MenuRestaurant"("userId")`,
  `CREATE TABLE IF NOT EXISTS "MenuRequest" (
    "id" TEXT PRIMARY KEY, "restaurantId" TEXT NOT NULL ${FK('MenuRestaurant')},
    "kind" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'new', "tableLabel" TEXT,
    "items" JSONB, "total" DOUBLE PRECISION, "name" TEXT, "phone" TEXT, "guests" INTEGER,
    "date" TEXT, "time" TEXT, "notes" TEXT, "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "MenuRequest_restaurantId_createdAt_idx" ON "MenuRequest"("restaurantId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "MenuRequest_restaurantId_status_idx" ON "MenuRequest"("restaurantId", "status")`,
  `CREATE TABLE IF NOT EXISTS "MenuPhoto" (
    "id" TEXT PRIMARY KEY, "restaurantId" TEXT NOT NULL ${FK('MenuRestaurant')},
    "mime" TEXT NOT NULL, "size" INTEGER NOT NULL, "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS "MenuPhoto_restaurantId_idx" ON "MenuPhoto"("restaurantId")`,
];
