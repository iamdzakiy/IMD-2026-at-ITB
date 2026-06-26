/**
 * ============================================================================
 * E2E TEST: Semifinal Announcement & Semifinal Phase
 * ============================================================================
 *
 * Tests the full admin approval/rejection flow with REAL emails:
 *
 *   SETUP → Create test user, registration, team, preliminary submission
 *
 *   STEP 1: Admin approves preliminary submission
 *           → Email: "Submission Approved!" → Dashboard: semifinal phase
 *
 *   STEP 2: Create semifinal submission → Admin REJECTS it
 *           → Email: "Semifinal Review (NOT SELECTED)" → Dashboard: rejection feedback
 *
 *   STEP 3: Reset → Create new semifinal → Admin APPROVES it
 *           → Email: "Semifinal Approved — Finalist!" → Dashboard: final phase
 *
 *   CLEANUP → Delete all test records (safe, only deletes what we created)
 *
 * Usage:
 *   npx tsx scripts/test-semifinal-e2e.ts          # Run full test
 *   npx tsx scripts/test-semifinal-e2e.ts cleanup   # Cleanup only (if interrupted)
 *
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import * as readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

// ── Config ──
const TEST_EMAIL = 'charlesinlotte@gmail.com';
const TEST_NAME = 'Charles E2E Test';
const TEST_TEAM_NAME = '__E2E_TEST_Semifinal_Flow__';
const TEST_PASSWORD = 'TestSemifinal123!';
const COMPETITION_CODE = 'BCC';

// ── Mail transporter (same config as production) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: `"The IMD 2026 at ITB - IMD 2026 at ITB" <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    ...options,
  });
}

function getBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_BASE_URL?.replace(/['"]/g, '').trim();
  if (u) return u.replace(/\/+$/, '');
  const n = process.env.NEXTAUTH_URL?.replace(/['"]/g, '').trim();
  if (n) return n.replace(/\/+$/, '');
  const v = process.env.VERCEL_URL?.trim();
  if (v) return `https://${v}`;
  return 'http://localhost:3000';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Interactive prompt (skipped with --no-pause) ──
const NO_PAUSE = process.argv.includes('--no-pause');
const rl = NO_PAUSE
  ? null
  : readline.createInterface({ input: process.stdin, output: process.stdout });
function waitForEnter(msg: string): Promise<void> {
  if (NO_PAUSE) {
    console.log(`\n  ℹ️  ${msg} (--no-pause: continuing automatically)\n`);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    rl!.question(`\n  ⏸️  ${msg}\n     Press ENTER to continue...`, () =>
      resolve(),
    );
  });
}

// ── Track created IDs for cleanup ──
const createdIds = {
  userId: null as string | null,
  userExisted: false,
  registrationId: null as string | null,
  teamId: null as string | null,
  memberIds: [] as string[],
  preliminaryId: null as string | null,
  semifinalId: null as string | null,
};

// ════════════════════════════════════════════════════════════════════════════
// CLEANUP — safe, only deletes records we created
// ════════════════════════════════════════════════════════════════════════════
async function cleanup() {
  console.log('\n🧹 CLEANUP — Removing all test records...');

  // Find test data by team name (unique marker)
  const team = await prisma.team.findFirst({
    where: { teamName: TEST_TEAM_NAME },
    include: {
      members: true,
      registration: {
        include: {
          preliminary: true,
          semifinal: true,
          payment: true,
          user: true,
        },
      },
    },
  });

  if (!team) {
    console.log('   No test data found. Nothing to clean up.');
    return;
  }

  const reg = team.registration;

  // Delete in order (foreign key constraints)
  if (reg?.semifinal) {
    await prisma.semifinalSubmission.delete({
      where: { id: reg.semifinal.id },
    });
    console.log(`   ✅ Deleted semifinal submission: ${reg.semifinal.id}`);
  }
  if (reg?.preliminary) {
    await prisma.preliminarySubmission.delete({
      where: { id: reg.preliminary.id },
    });
    console.log(`   ✅ Deleted preliminary submission: ${reg.preliminary.id}`);
  }
  if (reg?.payment) {
    await prisma.payment.delete({ where: { id: reg.payment.id } });
    console.log(`   ✅ Deleted payment: ${reg.payment.id}`);
  }

  // Delete team members
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
  console.log(`   ✅ Deleted ${team.members.length} team members`);

  // Delete team
  await prisma.team.delete({ where: { id: team.id } });
  console.log(`   ✅ Deleted team: ${team.teamName}`);

  // Delete registration
  if (reg) {
    await prisma.competitionRegistration.delete({ where: { id: reg.id } });
    console.log(`   ✅ Deleted registration: ${reg.id}`);
  }

  // Delete user (only if we created it — check if they had other data)
  if (reg?.user) {
    const otherRegistrations = await prisma.competitionRegistration.findFirst({
      where: { userId: reg.user.id },
    });
    if (!otherRegistrations) {
      await prisma.user.delete({ where: { id: reg.user.id } });
      console.log(`   ✅ Deleted test user: ${reg.user.email}`);
    } else {
      console.log(
        `   ⚠️  Kept user (has other registrations): ${reg.user.email}`,
      );
    }
  }

  // Revert registration phase back to 'semifinal' if we changed it
  // (not needed — we deleted the registration entirely)

  console.log('   ✅ Cleanup complete. No test artifacts remain.\n');
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════════════════
async function setup() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  E2E TEST: Semifinal Announcement & Phase Flow          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  Email:       ${TEST_EMAIL}`);
  console.log(`  Competition: ${COMPETITION_CODE}`);
  console.log(`  Base URL:    ${getBaseUrl()}`);

  // Clean up any leftover test data from previous runs
  await cleanup();

  // 1. Get competition
  const competition = await prisma.competition.findUnique({
    where: { code: COMPETITION_CODE },
  });
  if (!competition)
    throw new Error(`Competition ${COMPETITION_CODE} not found`);
  console.log(`\n  ✅ Competition: ${competition.name}`);

  // 2. Create or find user
  let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (user) {
    // Check for existing registration
    const existingReg = await prisma.competitionRegistration.findFirst({
      where: { userId: user.id },
    });
    if (existingReg) {
      throw new Error(
        `User ${TEST_EMAIL} already has a real registration (${existingReg.id}). ` +
          `Cannot use this email for testing. Choose a different email.`,
      );
    }
    createdIds.userExisted = true;
    console.log(
      `  ℹ️  User exists: ${user.email} (${user.id}) — will reuse, not delete`,
    );
  } else {
    user = await prisma.user.create({
      data: {
        username: `e2e_test_${Date.now().toString(36)}`,
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: await hash(TEST_PASSWORD, 10),
        active: true,
        emailVerified: new Date(),
      },
    });
    console.log(`  ✅ Created user: ${user.email} (${user.id})`);
  }
  createdIds.userId = user.id;

  // 3. Create registration + team + preliminary submission
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
                fullName: TEST_NAME,
                email: TEST_EMAIL,
                phoneNumber: '081234567890',
                institution: 'E2E Test University',
                orderIndex: 0,
              },
            ],
          },
        },
      },
    },
    include: {
      team: { include: { members: true } },
      competition: true,
      user: true,
    },
  });
  createdIds.registrationId = registration.id;
  createdIds.teamId = registration.team!.id;
  createdIds.memberIds = registration.team!.members.map((m) => m.id);

  // 4. Create preliminary submission (pending, ready for admin review)
  const preliminary = await prisma.preliminarySubmission.create({
    data: {
      registrationId: registration.id,
      fileUrl: 'https://example.com/test-preliminary.pdf',
      fileName: 'test-preliminary.pdf',
      fileSize: 1024000,
      status: 'pending',
    },
  });
  createdIds.preliminaryId = preliminary.id;

  console.log(`  ✅ Registration: ${registration.id} (phase: preliminary)`);
  console.log(`  ✅ Team: ${TEST_TEAM_NAME}`);
  console.log(`  ✅ Preliminary submission: ${preliminary.id} (pending)`);
  console.log('\n  Setup complete. Starting tests...\n');

  return { user, registration, competition, preliminary };
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 1: Admin approves preliminary → semifinalist announcement
// ════════════════════════════════════════════════════════════════════════════
async function step1_approvePreliminary(
  ctx: Awaited<ReturnType<typeof setup>>,
) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STEP 1: Admin approves preliminary → Semifinalist Email');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Atomic update (same as production approve route)
  await prisma.$transaction([
    prisma.preliminarySubmission.update({
      where: { id: ctx.preliminary.id },
      data: {
        status: 'qualified',
        reviewedAt: new Date(),
        reviewNotes: '[E2E TEST] Submission approved — advancing to semifinal',
      },
    }),
    prisma.competitionRegistration.update({
      where: { id: ctx.registration.id },
      data: {
        currentPhase: 'semifinal',
        isPreliminaryQualified: true,
      },
    }),
  ]);
  console.log(
    '  ✅ DB updated: preliminary=qualified, phase=semifinal, isPreliminaryQualified=true',
  );

  // Send email (exact same template as production)
  const teamName = ctx.registration.team?.teamName || 'N/A';
  const leaderName =
    ctx.registration.team?.members?.[0]?.fullName || ctx.user.name;
  const compName = ctx.competition.name;
  const feedback =
    '[E2E TEST] Excellent work! Your executive summary met all criteria.';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #0B0102 0%, #190204 50%, #0B0102 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background-color: #1a0405; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(255, 205, 141, 0.2); }
          .header { background: linear-gradient(135deg, #190204 0%, #2d0609 100%); padding: 40px 30px; text-align: center; }
          .site-title { margin: 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; }
          .subtitle { margin: 8px 0 0 0; color: #E8B4A8; font-size: 14px; font-weight: 500; }
          .content { padding: 40px 30px; background-color: #1a0405; }
          .title { margin: 0 0 20px 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: bold; }
          .text { margin: 0 0 16px 0; color: #E8B4A8; font-size: 16px; line-height: 1.7; }
          .status-badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 10px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; border: 1px solid rgba(16, 185, 129, 0.3); margin: 20px 0; }
          .info-box { background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%); border-left: 4px solid #8B3A3A; padding: 18px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(139, 58, 58, 0.3); }
          .info-text { margin: 4px 0; color: #FFCD8D; font-size: 14px; line-height: 1.6; }
          .button-container { text-align: center; margin: 35px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B3A3A 0%, #5A2424 100%); color: #FFFFFF; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(139, 58, 58, 0.4); border: 1px solid rgba(255, 205, 141, 0.3); }
          .steps { margin-top: 20px; padding-left: 20px; color: #E8B4A8; }
          .steps li { margin-bottom: 8px; }
          .footer { background: linear-gradient(135deg, #0B0102 0%, #190204 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 205, 141, 0.1); }
          .footer-text { margin: 0 0 8px 0; color: #9b7a6f; font-size: 13px; }
          .footer-copyright { margin: 8px 0 0 0; color: #6b5651; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="site-title">The IMD 2026 at ITB 3.0</h1>
            <p class="subtitle">IMD 2026 at ITB Student Branch</p>
          </div>
          <div class="content">
            <h2 class="title">\u{1F389} Submission Approved!</h2>
            <p class="text">Dear <strong style="color: #FFCD8D;">${leaderName}</strong>,</p>
            <p class="text">Congratulations! Your preliminary submission for <strong style="color: #FFCD8D;">${compName}</strong> has been approved!</p>
            <div style="text-align: center;"><span class="status-badge">\u2705 APPROVED</span></div>
            <div class="info-box">
              <p class="info-text"><strong>Team:</strong> ${teamName}</p>
              <p class="info-text"><strong>Competition:</strong> ${compName}</p>
              <p class="info-text"><strong>Submission:</strong> test-preliminary.pdf</p>
              <p class="info-text"><strong>Reviewed:</strong> ${new Date().toLocaleString('id-ID')}</p>
            </div>
            <div class="info-box"><p class="info-text"><strong>Reviewer Feedback:</strong></p><p class="info-text">${escapeHtml(feedback)}</p></div>
            <p class="text" style="margin-top: 24px;"><strong style="color: #FFCD8D;">Next Steps:</strong></p>
            <ol class="steps"><li>Prepare your semifinal materials</li><li>Upload through the dashboard</li><li>Wait for evaluation</li></ol>
            <div class="button-container"><a href="${getBaseUrl()}/dashboard" class="button">Go to Dashboard</a></div>
            <p class="text" style="margin-top: 24px;">Keep up the great work!</p>
          </div>
          <div class="footer">
            <p class="footer-text">Need help? Contact us at <a href="mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org" style="color: #FFCD8D; text-decoration: none;">imd 2026 at itb@IMD 2026 at ITB-itb.org</a></p>
            <p class="footer-copyright">\u00a9 2026 The IMD 2026 at ITB - IMD 2026 at ITB Student Branch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`  📧 Sending preliminary approval email to ${TEST_EMAIL}...`);
  await sendMail({
    to: TEST_EMAIL,
    subject: `✅ Preliminary Submission Approved - ${compName}`,
    html: emailHtml,
  });
  console.log('  ✅ Email sent!\n');

  await waitForEnter(
    `Check ${TEST_EMAIL} for the PRELIMINARY APPROVAL email.\n` +
      `     Also login at ${getBaseUrl()}/login → Dashboard should show "Semifinal Phase".`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2: Create semifinal submission → Admin REJECTS it
// ════════════════════════════════════════════════════════════════════════════
async function step2_rejectSemifinal(ctx: Awaited<ReturnType<typeof setup>>) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STEP 2: Create semifinal submission → Admin REJECTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create semifinal submission
  const semifinal = await prisma.semifinalSubmission.create({
    data: {
      registrationId: ctx.registration.id,
      competitionType: COMPETITION_CODE as any,
      businessPlanUrl: 'https://example.com/test-businessplan.pdf',
      pitchDeckUrl: 'https://example.com/test-pitchdeck.pdf',
      status: 'pending',
    },
  });
  createdIds.semifinalId = semifinal.id;
  console.log(`  ✅ Created semifinal submission: ${semifinal.id} (pending)`);

  // Reject (same logic as production — does NOT change phase)
  const rejectionFeedback =
    '[E2E TEST] The business plan needs more detailed financial projections. Please revise section 4 and resubmit.';

  await prisma.semifinalSubmission.update({
    where: { id: semifinal.id },
    data: {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: 'e2e-test-admin',
      reviewNotes: rejectionFeedback,
    },
  });
  console.log('  ✅ DB updated: semifinal=rejected (phase stays semifinal)');

  // Send rejection email (exact same template as production)
  const teamName = ctx.registration.team?.teamName || 'N/A';
  const leaderName =
    ctx.registration.team?.members?.[0]?.fullName || ctx.user.name;
  const compName = ctx.competition.name;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #0B0102 0%, #190204 50%, #0B0102 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background-color: #1a0405; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(255, 205, 141, 0.2); }
          .header { background: linear-gradient(135deg, #190204 0%, #2d0609 100%); padding: 40px 30px; text-align: center; }
          .site-title { margin: 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; }
          .subtitle { margin: 8px 0 0 0; color: #E8B4A8; font-size: 14px; font-weight: 500; }
          .content { padding: 40px 30px; background-color: #1a0405; }
          .title { margin: 0 0 20px 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: bold; }
          .text { margin: 0 0 16px 0; color: #E8B4A8; font-size: 16px; line-height: 1.7; }
          .status-badge { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 10px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; border: 1px solid rgba(239, 68, 68, 0.3); margin: 20px 0; }
          .info-box { background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%); border-left: 4px solid #8B3A3A; padding: 18px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(139, 58, 58, 0.3); }
          .info-text { margin: 4px 0; color: #FFCD8D; font-size: 14px; line-height: 1.6; }
          .feedback-box { background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 12px; margin: 24px 0; }
          .feedback-title { margin: 0 0 10px 0; color: #ef4444; font-size: 16px; font-weight: bold; }
          .feedback-text { margin: 0; color: #E8B4A8; font-size: 15px; line-height: 1.7; }
          .button-container { text-align: center; margin: 35px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B3A3A 0%, #5A2424 100%); color: #FFFFFF; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(139, 58, 58, 0.4); border: 1px solid rgba(255, 205, 141, 0.3); }
          .footer { background: linear-gradient(135deg, #0B0102 0%, #190204 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 205, 141, 0.1); }
          .footer-text { margin: 0 0 8px 0; color: #9b7a6f; font-size: 13px; }
          .footer-copyright { margin: 8px 0 0 0; color: #6b5651; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="site-title">The IMD 2026 at ITB 3.0</h1>
            <p class="subtitle">IMD 2026 at ITB Student Branch</p>
          </div>
          <div class="content">
            <h2 class="title">\u{1F4CB} Semifinal Review</h2>
            <p class="text">Dear <strong style="color: #FFCD8D;">${leaderName}</strong>,</p>
            <p class="text">Thank you for submitting your semifinal work for <strong style="color: #FFCD8D;">${compName}</strong>.</p>
            <div style="text-align: center;"><span class="status-badge">\u274c NOT SELECTED</span></div>
            <div class="info-box">
              <p class="info-text"><strong>Team:</strong> ${teamName}</p>
              <p class="info-text"><strong>Competition:</strong> ${compName}</p>
              <p class="info-text"><strong>Reviewed:</strong> ${new Date().toLocaleString('id-ID')}</p>
            </div>
            <div class="feedback-box">
              <p class="feedback-title">\u{1F4DD} Reviewer Feedback:</p>
              <p class="feedback-text">${escapeHtml(rejectionFeedback)}</p>
            </div>
            <p class="text" style="margin-top: 24px;">We appreciate your hard work and dedication throughout this competition. Thank you for participating in The IMD 2026 at ITB 3.0!</p>
            <div class="button-container"><a href="${getBaseUrl()}/dashboard" class="button">Go to Dashboard</a></div>
          </div>
          <div class="footer">
            <p class="footer-text">Need help? Contact us at <a href="mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org" style="color: #FFCD8D; text-decoration: none;">imd 2026 at itb@IMD 2026 at ITB-itb.org</a></p>
            <p class="footer-copyright">\u00a9 2026 The IMD 2026 at ITB - IMD 2026 at ITB Student Branch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`  📧 Sending semifinal REJECTION email to ${TEST_EMAIL}...`);
  await sendMail({
    to: TEST_EMAIL,
    subject: `📋 Semifinal Submission Review - ${compName}`,
    html: emailHtml,
  });
  console.log('  ✅ Email sent!\n');

  await waitForEnter(
    `Check ${TEST_EMAIL} for the SEMIFINAL REJECTION email.\n` +
      `     Dashboard should still show "Semifinal" phase (not advanced to final).`,
  );

  return semifinal;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3: Reset semifinal → Create new → Admin APPROVES → Finalist
// ════════════════════════════════════════════════════════════════════════════
async function step3_approveSemifinal(ctx: Awaited<ReturnType<typeof setup>>) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STEP 3: Reset → New semifinal submission → Admin APPROVES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Delete the rejected semifinal to simulate fresh submission
  if (createdIds.semifinalId) {
    await prisma.semifinalSubmission.delete({
      where: { id: createdIds.semifinalId },
    });
    console.log(`  ✅ Deleted rejected semifinal: ${createdIds.semifinalId}`);
  }

  // Create new semifinal submission
  const semifinal = await prisma.semifinalSubmission.create({
    data: {
      registrationId: ctx.registration.id,
      competitionType: COMPETITION_CODE as any,
      businessPlanUrl: 'https://example.com/test-businessplan-v2.pdf',
      pitchDeckUrl: 'https://example.com/test-pitchdeck-v2.pdf',
      status: 'pending',
    },
  });
  createdIds.semifinalId = semifinal.id;
  console.log(
    `  ✅ Created new semifinal submission: ${semifinal.id} (pending)`,
  );

  // Approve (same as production — advances to final)
  await prisma.$transaction([
    prisma.semifinalSubmission.update({
      where: { id: semifinal.id },
      data: {
        status: 'qualified',
        reviewedAt: new Date(),
        reviewedBy: 'e2e-test-admin',
        reviewNotes:
          '[E2E TEST] Semifinal submission approved — advancing to final',
      },
    }),
    prisma.competitionRegistration.update({
      where: { id: ctx.registration.id },
      data: {
        currentPhase: 'final',
        isSemifinalQualified: true,
      },
    }),
  ]);
  console.log(
    '  ✅ DB updated: semifinal=qualified, phase=final, isSemifinalQualified=true',
  );

  // Send approval email (exact same template as production)
  const teamName = ctx.registration.team?.teamName || 'N/A';
  const leaderName =
    ctx.registration.team?.members?.[0]?.fullName || ctx.user.name;
  const compName = ctx.competition.name;
  const feedback =
    '[E2E TEST] Outstanding business plan and pitch deck! Welcome to the finals.';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #0B0102 0%, #190204 50%, #0B0102 100%); min-height: 100vh; }
          .container { max-width: 600px; margin: 40px auto; background-color: #1a0405; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(255, 205, 141, 0.2); }
          .header { background: linear-gradient(135deg, #190204 0%, #2d0609 100%); padding: 40px 30px; text-align: center; }
          .site-title { margin: 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; }
          .subtitle { margin: 8px 0 0 0; color: #E8B4A8; font-size: 14px; font-weight: 500; }
          .content { padding: 40px 30px; background-color: #1a0405; }
          .title { margin: 0 0 20px 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: bold; }
          .text { margin: 0 0 16px 0; color: #E8B4A8; font-size: 16px; line-height: 1.7; }
          .status-badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 10px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; border: 1px solid rgba(16, 185, 129, 0.3); margin: 20px 0; }
          .info-box { background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%); border-left: 4px solid #8B3A3A; padding: 18px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(139, 58, 58, 0.3); }
          .info-text { margin: 4px 0; color: #FFCD8D; font-size: 14px; line-height: 1.6; }
          .button-container { text-align: center; margin: 35px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #8B3A3A 0%, #5A2424 100%); color: #FFFFFF; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(139, 58, 58, 0.4); border: 1px solid rgba(255, 205, 141, 0.3); }
          .steps { margin-top: 20px; padding-left: 20px; color: #E8B4A8; }
          .steps li { margin-bottom: 8px; }
          .footer { background: linear-gradient(135deg, #0B0102 0%, #190204 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 205, 141, 0.1); }
          .footer-text { margin: 0 0 8px 0; color: #9b7a6f; font-size: 13px; }
          .footer-copyright { margin: 8px 0 0 0; color: #6b5651; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="site-title">The IMD 2026 at ITB 3.0</h1>
            <p class="subtitle">IMD 2026 at ITB Student Branch</p>
          </div>
          <div class="content">
            <h2 class="title">\u{1F3C6} Semifinal Approved!</h2>
            <p class="text">Dear <strong style="color: #FFCD8D;">${leaderName}</strong>,</p>
            <p class="text">Congratulations! Your semifinal submission for <strong style="color: #FFCD8D;">${compName}</strong> has been approved! You have advanced to the final round!</p>
            <div style="text-align: center;"><span class="status-badge">\u2705 APPROVED — FINALIST</span></div>
            <div class="info-box">
              <p class="info-text"><strong>Team:</strong> ${teamName}</p>
              <p class="info-text"><strong>Competition:</strong> ${compName}</p>
              <p class="info-text"><strong>Reviewed:</strong> ${new Date().toLocaleString('id-ID')}</p>
            </div>
            <div class="info-box"><p class="info-text"><strong>Reviewer Feedback:</strong></p><p class="info-text">${escapeHtml(feedback)}</p></div>
            <p class="text" style="margin-top: 24px;"><strong style="color: #FFCD8D;">Next Steps:</strong></p>
            <ol class="steps"><li>Prepare your final pitch deck</li><li>Upload through the dashboard before the deadline</li><li>Get ready for the final presentation</li></ol>
            <div class="button-container"><a href="${getBaseUrl()}/dashboard" class="button">Go to Dashboard</a></div>
          </div>
          <div class="footer">
            <p class="footer-text">Need help? Contact us at <a href="mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org" style="color: #FFCD8D; text-decoration: none;">imd 2026 at itb@IMD 2026 at ITB-itb.org</a></p>
            <p class="footer-copyright">\u00a9 2026 The IMD 2026 at ITB - IMD 2026 at ITB Student Branch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(
    `  📧 Sending semifinal APPROVAL (finalist) email to ${TEST_EMAIL}...`,
  );
  await sendMail({
    to: TEST_EMAIL,
    subject: `🏆 Semifinal Approved — You're a Finalist! - ${compName}`,
    html: emailHtml,
  });
  console.log('  ✅ Email sent!\n');

  await waitForEnter(
    `Check ${TEST_EMAIL} for the FINALIST APPROVAL email.\n` +
      `     Dashboard should now show "Final" phase.`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  // Cleanup-only mode
  if (process.argv[2] === 'cleanup') {
    await cleanup();
    await prisma.$disconnect();
    rl?.close();
    return;
  }

  try {
    const ctx = await setup();
    await step1_approvePreliminary(ctx);
    await step2_rejectSemifinal(ctx);
    await step3_approveSemifinal(ctx);

    console.log(
      '\n╔══════════════════════════════════════════════════════════╗',
    );
    console.log('║  ✅ ALL 3 STEPS COMPLETE                                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\n  Emails sent:');
    console.log('    1. ✅ Preliminary Approved → Semifinalist announcement');
    console.log('    2. ❌ Semifinal Rejected → NOT SELECTED feedback');
    console.log('    3. ✅ Semifinal Approved → FINALIST announcement');
    console.log(`\n  All sent to: ${TEST_EMAIL}`);

    await waitForEnter('Verify all 3 emails arrived. Ready to cleanup?');

    await cleanup();
    console.log('  🎉 E2E test complete. All test data removed.\n');
  } catch (error) {
    console.error(
      '\n❌ TEST FAILED:',
      error instanceof Error ? error.message : error,
    );
    console.error(
      '\n  Run cleanup manually: npx tsx scripts/test-semifinal-e2e.ts cleanup\n',
    );
  } finally {
    await prisma.$disconnect();
    rl?.close();
  }
}

main();
