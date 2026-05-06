require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

async function seed() {
  console.log('🌱  Seeding Neon database...');

  // Wipe existing data (order matters for FK constraints)
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.projectFile.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  await prisma.user.create({
    data: {
      name: 'Mounir Banni',
      email: 'admin@mbndev.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      company: 'MBN DEV',
    },
  });

  // Demo client
  const client = await prisma.user.create({
    data: {
      name: 'Youssef A.',
      email: 'client@demo.com',
      password: await bcrypt.hash('client123', 12),
      role: 'client',
      company: 'Demo Business',
    },
  });

  // Demo project
  await prisma.project.create({
    data: {
      title: 'E-Commerce Website',
      description: 'A full-featured online store with payment integration.',
      type: 'ecommerce',
      status: 'in-progress',
      progress: 60,
      budget: 699,
      package: 'pro',
      features: ['Payment Integration', 'Admin Dashboard', 'SEO Optimization'],
      designStyle: 'Modern',
      designColors: ['#7c3aed', '#3b82f6'],
      clientId: client.id,
      milestones: {
        create: [
          { title: 'Design', amount: 200, status: 'paid' },
          { title: 'Development', amount: 499, status: 'pending' },
        ],
      },
    },
  });

  // Pricing packages
  await prisma.package.createMany({
    data: [
      {
        name: 'Starter',
        slug: 'starter',
        price: 299,
        description: 'Perfect for small projects',
        features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '1 Revision'],
        pages: 5,
        revisions: 1,
        deliveryDays: 7,
        popular: false,
      },
      {
        name: 'Pro',
        slug: 'pro',
        price: 699,
        description: 'Best for growing businesses',
        features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support'],
        pages: 10,
        revisions: 3,
        deliveryDays: 14,
        popular: true,
      },
      {
        name: 'Premium',
        slug: 'premium',
        price: 1299,
        description: 'For complex and custom projects',
        features: ['Unlimited Pages', 'Custom Features', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code'],
        pages: 999,
        revisions: 6,
        deliveryDays: 30,
        popular: false,
      },
    ],
  });

  console.log('✅  Seed complete!');
  console.log('   Admin  → admin@mbndev.com  / admin123');
  console.log('   Client → client@demo.com   / client123');
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
