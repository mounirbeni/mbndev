require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

// Seed is deliberately additive. Never delete customers, projects, payments,
// or existing packages from a shared/production database.
const initialPackages = [
  {
    name: 'Starter', slug: 'starter', price: 799,
    description: 'Perfect for small businesses and personal projects',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    pages: 5, revisions: 2, deliveryDays: 14, popular: false,
  },
  {
    name: 'Pro', slug: 'pro', price: 1799,
    description: 'Best for growing businesses who need more',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    pages: 10, revisions: 3, deliveryDays: 21, popular: true,
  },
  {
    name: 'Premium', slug: 'premium', price: 3499,
    description: 'For complex projects with custom requirements',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance', 'Delivery in 30 days'],
    pages: 999, revisions: 6, deliveryDays: 30, popular: false,
  },
];

async function seed() {
  // Fail closed on production. Initializing a new production environment is a
  // separate, explicit operator action, never part of deployment or startup.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is disabled in production. Configure initial data through an audited administrative process.');
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (Boolean(email) !== Boolean(password)) {
    throw new Error('Set both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, or neither.');
  }
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 16)) {
    throw new Error('SEED_ADMIN_EMAIL must be valid and SEED_ADMIN_PASSWORD must contain at least 16 characters.');
  }

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role !== 'admin') {
      throw new Error('The requested admin email belongs to an existing non-admin user. Refusing privilege escalation.');
    }
    if (!existing) {
      await prisma.user.create({
        data: {
          name: process.env.SEED_ADMIN_NAME?.trim() || 'MBN DEV Admin',
          email,
          password: await bcrypt.hash(password, 12),
          role: 'admin',
          company: 'MBN DEV',
        },
      });
      console.log('[seed] Initial administrator created.');
    } else {
      console.log('[seed] Administrator already exists; credentials left unchanged.');
    }
  } else {
    console.log('[seed] No admin credentials supplied; skipping administrator creation.');
  }

  const result = await prisma.package.createMany({
    data: initialPackages,
    skipDuplicates: true,
  });
  console.log(`[seed] Added ${result.count} missing package(s); existing prices and all customer data preserved.`);
}

if (require.main === module) {
  seed()
    .catch((error) => { console.error('[seed] Failed:', error.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}

module.exports = { seed, initialPackages };
