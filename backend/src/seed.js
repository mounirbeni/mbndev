require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

async function seed() {
  console.log('🌱  Seeding Neon database...');

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

  // Admin account only — no demo data
  await prisma.user.create({
    data: {
      name: 'Mounir Banni',
      email: 'admin@mbndev.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      company: 'MBN DEV',
    },
  });

  // Pricing packages
  await prisma.package.createMany({
    data: [
      {
        name: 'Starter',
        slug: 'starter',
        price: 799,
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
        price: 1799,
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
        price: 3499,
        description: 'For complex projects with custom requirements',
        features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance', 'Delivery in 30 days'],
        pages: 999,
        revisions: 6,
        deliveryDays: 30,
        popular: false,
      },
    ],
  });

  console.log('✅  Seed complete!');
  console.log('   Admin → admin@mbndev.com / admin123');
  console.log('   ℹ️   No demo client or demo project seeded — real data only.');
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
