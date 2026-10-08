require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('./lib/prisma');

async function seed() {
  console.log('[seed] Seeding Neon database...');

  // Wipe existing data (order matters for FK constraints)
  await prisma.activityLog?.deleteMany().catch(() => {});
  await prisma.notification?.deleteMany().catch(() => {});
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.projectFile.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.order?.deleteMany().catch(() => {});
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // Admin account only — no demo data. The password comes from
  // SEED_ADMIN_PASSWORD, or a random one is generated and printed once.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  await prisma.user.create({
    data: {
      name: 'Mounir Banni',
      email: 'admin@mbndev.com',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
      company: 'MBN DEV',
    },
  });

  // Pricing packages — keep in sync with backend/src/lib/pricing.js
  await prisma.package.createMany({
    data: [
      {
        name: 'Starter',
        slug: 'starter',
        price: 1290,
        description: 'Perfect for small businesses and personal projects',
        features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
        pages: 5,
        revisions: 2,
        deliveryDays: 14,
        popular: false,
      },
      {
        name: 'Pro',
        slug: 'pro',
        price: 2690,
        description: 'Best for growing businesses who need more',
        features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
        pages: 10,
        revisions: 3,
        deliveryDays: 21,
        popular: true,
      },
      {
        name: 'Premium',
        slug: 'premium',
        price: 5490,
        description: 'For complex projects with custom requirements',
        features: ['Up to 20 Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance', 'Delivery in 30 days'],
        pages: 20,
        revisions: 6,
        deliveryDays: 30,
        popular: false,
      },
    ],
  });

  console.log(`[seed] Done. Admin -> admin@mbndev.com / ${process.env.SEED_ADMIN_PASSWORD ? '(SEED_ADMIN_PASSWORD)' : adminPassword}`);
  console.log('[seed] No demo client or project seeded — real data only.');
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
