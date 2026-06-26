/**
 * ============================================================================
 * TEST SETUP: Presigned Upload Fix Verification
 * ============================================================================
 *
 * Creates a test user + approved BCC registration and extends the preliminary
 * deadline so you can manually test uploading a 4.5–10 MB file in the browser.
 *
 * Usage:
 *   npx tsx scripts/test-upload-setup.ts          # Setup test data
 *   npx tsx scripts/test-upload-setup.ts cleanup   # Remove test data & restore deadline
 *
 * After setup:
 *   1. Login at /login with:  test-upload@imd 2026 at itb.dev / TestUpload123!
 *   2. Go to /dashboard → Submissions → Preliminary
 *   3. Upload a PDF between 4.5 MB and 10 MB
 *   4. Verify it succeeds (presigned URL flow) instead of the old JSON parse error
 *
 * After testing, run the cleanup command above.
 * ============================================================================
 */

import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_EMAIL = 'test-upload@imd 2026 at itb.dev';
const TEST_USERNAME = 'test-upload-user';
const TEST_PASSWORD = 'TestUpload123!';
const TEST_TEAM_NAME = 'Upload Test Team';
const COMPETITION_CODE = 'BCC';

// We'll extend the deadline to 7 days from now
const EXTENDED_DEADLINE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

async function setup() {
  console.log(
    '🔧 Setting up test environment for presigned upload verification...\n',
  );

  // 1. Find the BCC competition
  const competition = await prisma.competition.findUnique({
    where: { code: COMPETITION_CODE },
  });

  if (!competition) {
    console.error(
      `❌ Competition "${COMPETITION_CODE}" not found. Run seed first.`,
    );
    process.exit(1);
  }

  // Save original deadline for cleanup
  const originalDeadline = competition.preliminaryDeadline;
  console.log(
    `📅 Original preliminary deadline: ${originalDeadline.toISOString()}`,
  );
  console.log(
    `📅 Extending deadline to:          ${EXTENDED_DEADLINE.toISOString()}\n`,
  );

  // 2. Extend the preliminary deadline
  await prisma.competition.update({
    where: { code: COMPETITION_CODE },
    data: { preliminaryDeadline: EXTENDED_DEADLINE },
  });

  // 3. Create test user (or reuse if exists)
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { password: hashedPassword, active: true },
    create: {
      username: TEST_USERNAME,
      name: 'Upload Tester',
      email: TEST_EMAIL,
      password: hashedPassword,
      active: true,
      emailVerified: new Date(),
    },
  });

  console.log(`👤 Test user: ${user.email} (id: ${user.id})`);

  // 4. Check for existing registration
  const existingReg = await prisma.competitionRegistration.findUnique({
    where: { userId: user.id },
  });

  if (existingReg) {
    console.log(`✅ Registration already exists (id: ${existingReg.id})`);

    // Make sure it's in the right state
    await prisma.competitionRegistration.update({
      where: { id: existingReg.id },
      data: {
        verificationStatus: 'approved',
        currentPhase: 'preliminary',
      },
    });

    // Delete any existing preliminary submission so we can re-test
    await prisma.preliminarySubmission.deleteMany({
      where: { registrationId: existingReg.id },
    });
    console.log('🗑️  Cleared existing preliminary submission (if any)');
  } else {
    // 5. Create registration + team + member
    const registration = await prisma.competitionRegistration.create({
      data: {
        userId: user.id,
        competitionId: competition.id,
        verificationStatus: 'approved',
        currentPhase: 'preliminary',
        team: {
          create: {
            teamName: TEST_TEAM_NAME,
            leaderUserId: user.id,
            members: {
              create: [
                {
                  fullName: 'Upload Tester',
                  email: TEST_EMAIL,
                  phoneNumber: '08123456789',
                  institution: 'Test University',
                  orderIndex: 0,
                },
              ],
            },
          },
        },
      },
    });

    console.log(`✅ Registration created (id: ${registration.id})`);
  }

  // Store original deadline in a temp metadata record so cleanup knows what to restore
  // We'll use a simple approach: write it to stdout for the user
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  TEST ENVIRONMENT READY');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  Login URL:  /login`);
  console.log(`  Email:      ${TEST_EMAIL}`);
  console.log(`  Password:   ${TEST_PASSWORD}`);
  console.log(`  Competition: ${COMPETITION_CODE}`);
  console.log(
    `  Deadline extended until: ${EXTENDED_DEADLINE.toLocaleDateString()}`,
  );
  console.log('');
  console.log('  Steps:');
  console.log('  1. Login with the credentials above');
  console.log('  2. Go to Dashboard → Submissions → Preliminary');
  console.log('  3. Upload a PDF file between 4.5 MB and 10 MB');
  console.log('  4. Verify upload succeeds without JSON parse error');
  console.log('');
  console.log(`  Original deadline was: ${originalDeadline.toISOString()}`);
  console.log('  Run cleanup when done:');
  console.log('    npx tsx scripts/test-upload-setup.ts cleanup');
  console.log('════════════════════════════════════════════════════════\n');
}

async function cleanup() {
  console.log('🧹 Cleaning up test environment...\n');

  // 1. Find and delete test user + cascade
  const user = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    include: {
      registration: {
        include: { preliminary: true, team: true },
      },
    },
  });

  if (user) {
    // Prisma cascade will handle registration, team, members, submissions
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`🗑️  Deleted test user: ${TEST_EMAIL}`);
  } else {
    console.log('ℹ️  Test user not found (already cleaned up?)');
  }

  // 2. Restore original BCC preliminary deadline from seed
  // The seed value is: wib('2026-03-19T23:59:59') → UTC 2026-03-19T16:59:59Z (WIB = UTC+7)
  const originalDeadline = new Date('2026-03-19T16:59:59.000Z');

  await prisma.competition.update({
    where: { code: COMPETITION_CODE },
    data: { preliminaryDeadline: originalDeadline },
  });

  console.log(
    `📅 Restored BCC preliminary deadline to: ${originalDeadline.toISOString()}`,
  );
  console.log('\n✅ Cleanup complete.\n');
}

async function main() {
  const command = process.argv[2];

  try {
    if (command === 'cleanup') {
      await cleanup();
    } else {
      await setup();
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
