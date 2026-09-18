require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');
const { PACKAGE_INCLUSIONS } = require('./lib/pricing');

// Additive local development seed. Never delete existing users, projects,
// orders, payment records, messages or configured package prices.
const initialPackages = [
  {
    name: 'Starter', slug: 'starter', price: PACKAGE_INCLUSIONS.starter.price,
    description: 'For a small business website with an agreed scope.',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery schedule confirmed in proposal'],
    pages: PACKAGE_INCLUSIONS.starter.includedPages, revisions: 2, deliveryDays: 14, popular: false,
  },
  {
    name: 'Pro', slug: 'pro', price: PACKAGE_INCLUSIONS.pro.price,
    description: 'For a growing business with additional requirements.',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery schedule confirmed in proposal'],
    pages: PACKAGE_INCLUSIONS.pro.includedPages, revisions: 3, deliveryDays: 21, popular: true,
  },
  {
    name: 'Premium', slug: 'premium', price: PACKAGE_INCLUSIONS.premium.price,
    description: 'For advanced projects with a confirmed custom scope.',
    features: ['Up to 99 Pages', 'Custom Features by Agreement', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code by Agreement', 'Maintenance by Agreement', 'Delivery schedule confirmed in proposal'],
    pages: PACKAGE_INCLUSIONS.premium.includedPages, revisions: 6, deliveryDays: 30, popular: false,
  },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Production seeding is disabled. Initialize production through a separate audited process.');
  }
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (Boolean(email) !== Boolean(password)) {
    throw new Error('Set both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, or neither.');
  }
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 16)) {
    throw new Error('Use a valid SEED_ADMIN_EMAIL and a private SEED_ADMIN_PASSWORD of at least 16 characters.');
  }
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role !== 'admin') {
      throw new Error('Admin email already belongs to a non-admin account. No privilege escalation performed.');
    }
    if (existing) {
      console.log('[seed] Existing administrator preserved; credentials were not changed.');
    } else {
      await prisma.user.create({ data: {
        name: process.env.SEED_ADMIN_NAME?.trim() || 'MBN DEV Admin',
        email, password: await bcrypt.hash(password, 12), role: 'admin', company: 'MBN DEV',
      } });
      console.log('[seed] Initial administrator created.');
    }
  } else {
    console.log('[seed] No initial administrator credentials provided.');
  }
  const result = await prisma.package.createMany({ data: initialPackages, skipDuplicates: true });
  console.log(`[seed] Added ${result.count} missing package(s); existing prices and customer records unchanged.`);
}

if (require.main === module) {
  seed()
    .catch((error) => { console.error('[seed] Failed:', error.message); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}

module.exports = { seed, initialPackages };
