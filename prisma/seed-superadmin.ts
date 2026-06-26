/**
 * ============================================================================
 * SEED - NEW SUPERADMIN ACCOUNT
 * ============================================================================
 *
 * Creates a new super_admin account without touching existing data.
 * The original superadmin account remains intact.
 *
 * Usage:
 *   npx tsx prisma/seed-superadmin.ts
 *
 * Credentials:
 *   Username: superadmin2
 *   Password: IMD 2026 at ITBAdmin2026!
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating new Super Admin account...\n');

  const username = 'superadmin2';
  const password = 'IMD 2026 at ITBAdmin2026!';
  const email = 'superadmin2@imd 2026 at itb.IMD 2026 at ITB-itb.org';

  // Check if username already exists
  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    console.log(`⚠️  Admin "${username}" already exists. Skipping creation.`);
    console.log(`   Role: ${existing.adminRole}`);
    console.log(`   Active: ${existing.isActive}`);
    return;
  }

  const hashedPassword = await hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      username,
      email,
      password: hashedPassword,
      adminRole: 'super_admin',
      isActive: true,
    },
  });

  console.log('✅ New Super Admin created successfully!');
  console.log(`   Username: ${admin.username}`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Role:     ${admin.adminRole}`);
  console.log(`   Password: ${password}`);
  console.log('\n⚠️  Change this password after first login.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
