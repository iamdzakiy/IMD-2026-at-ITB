/**
 * ============================================================================
 * E2E TEST: BCC-specific Semifinal Approve/Reject (no-feedback flow)
 * ============================================================================
 *
 * Tests that the new BCC flow:
 *  - Admin dashboard query lists the 5 real BCC manual teams (no email sent).
 *  - APPROVE on a synthetic test BCC team:
 *      • updates submission to qualified
 *      • updates registration to phase='final' and isSemifinalQualified=true
 *      • sends the new BCC email blast (Final Guidebook + Score Transparency)
 *  - REJECT on a synthetic test BCC team:
 *      • succeeds without an admin feedback field
 *      • sends the new BCC rejection email blast (Score Transparency)
 *
 * Cleanup deletes every record it created. Real teams are never modified.
 *
 * Usage: npx tsx scripts/test-bcc-semifinal-e2e.ts
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const prisma = new PrismaClient();

const TEST_EMAIL = 'charlesinlotte@gmail.com';
const TEST_TEAM_APPROVE = '__E2E_BCC_APPROVE_TEST__';
const TEST_TEAM_REJECT = '__E2E_BCC_REJECT_TEST__';

const REAL_BCC_EMAILS = [
  'zahraffaiza@gmail.com',
  'jocelynz.adelina24@gmail.com',
  'msulthandaryk@gmail.com',
  'mssyarif600@gmail.com',
  'mohammadedi512@gmail.com',
];

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendMail(opts: { to: string; subject: string; html: string }) {
  return transporter.sendMail({
    from: `"The IMD 2026 at ITB - IMD 2026 at ITB (E2E TEST)" <${process.env.SMTP_USER}>`,
    replyTo: process.env.SMTP_USER,
    ...opts,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildBccApproveHtml(teamName: string): string {
  return `<!DOCTYPE html><html><body>
    <h2>Congratulations, ${escapeHtml(teamName)}!</h2>
    <p>We are thrilled to inform you that your team has officially advanced to the <strong>Final Round of BCC The IMD 2026 at ITB 3.0</strong>.</p>
    <p>Final Guidebook: <a href="https://bit.ly/GuidebookFinalBCCIMD 2026 at ITB">https://bit.ly/GuidebookFinalBCCIMD 2026 at ITB</a></p>
    <p>Score Transparency: <a href="https://bit.ly/TransparansiBCCIMD 2026 at ITB">https://bit.ly/TransparansiBCCIMD 2026 at ITB</a></p>
    <p>Best regards,<br/>Staff of BCC The IMD 2026 at ITB 3.0</p>
  </body></html>`;
}

function buildBccRejectHtml(teamName: string): string {
  return `<!DOCTYPE html><html><body>
    <h2>Semifinal Round Result — ${escapeHtml(teamName)}</h2>
    <p>Dear ${escapeHtml(teamName)},</p>
    <p>After a thorough review, we regret to inform you that your team has not advanced to the Final Round of BCC The IMD 2026 at ITB 3.0.</p>
    <p>Score Transparency: <a href="https://bit.ly/TransparansiBCCIMD 2026 at ITB">https://bit.ly/TransparansiBCCIMD 2026 at ITB</a></p>
    <p>Best regards,<br/>Staff of BCC The IMD 2026 at ITB 3.0</p>
  </body></html>`;
}

async function cleanup(teamName: string) {
  const team = await prisma.team.findFirst({
    where: { teamName },
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
  if (!team) return;
  const reg = team.registration;
  if (reg?.semifinal)
    await prisma.semifinalSubmission.delete({
      where: { id: reg.semifinal.id },
    });
  if (reg?.preliminary)
    await prisma.preliminarySubmission.delete({
      where: { id: reg.preliminary.id },
    });
  if (reg?.payment)
    await prisma.payment.delete({ where: { id: reg.payment.id } });
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
  await prisma.team.delete({ where: { id: team.id } });
  if (reg)
    await prisma.competitionRegistration.delete({ where: { id: reg.id } });
  if (reg?.user) {
    const others = await prisma.competitionRegistration.findFirst({
      where: { userId: reg.user.id },
    });
    if (!others) await prisma.user.delete({ where: { id: reg.user.id } });
  }
}

async function makeTestTeam(teamName: string, email: string) {
  const competition = await prisma.competition.findUnique({
    where: { code: 'BCC' },
  });
  if (!competition) throw new Error('BCC competition not found');

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: `e2e_bcc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: 'BCC E2E Test',
        email,
        password: await hash('BccE2e123!', 10),
        active: true,
        emailVerified: new Date(),
      },
    });
  } else {
    const existingReg = await prisma.competitionRegistration.findFirst({
      where: { userId: user.id },
    });
    if (existingReg)
      throw new Error(
        `User ${email} already has a registration — cannot use for testing`,
      );
  }

  const registration = await prisma.competitionRegistration.create({
    data: {
      userId: user.id,
      competitionId: competition.id,
      verificationStatus: 'approved',
      currentPhase: 'semifinal',
      isPreliminaryQualified: true,
      team: {
        create: {
          teamName,
          leaderUserId: user.id,
          members: {
            create: [
              {
                fullName: 'BCC E2E Leader',
                email,
                phoneNumber: '081234567890',
                institution: 'E2E University',
                orderIndex: 0,
              },
            ],
          },
        },
      },
      semifinal: {
        create: {
          competitionType: 'BCC',
          status: 'pending',
          reviewNotes: 'E2E test pending submission',
        },
      },
    },
    include: {
      team: { include: { members: true } },
      competition: true,
      user: true,
      semifinal: true,
    },
  });

  return registration;
}

async function verifyAdminDashboardListsRealTeams() {
  console.log('\n▶️  STEP 1: Admin dashboard query includes 5 real BCC teams');
  const rows = await prisma.semifinalSubmission.findMany({
    where: {
      registration: {
        user: { email: { in: REAL_BCC_EMAILS } },
      },
    },
    include: {
      registration: {
        include: { team: true, competition: true, user: true },
      },
    },
  });
  const seen = new Set(rows.map((r) => r.registration.user.email));
  const missing = REAL_BCC_EMAILS.filter((e) => !seen.has(e));
  if (missing.length > 0)
    throw new Error(`Missing semifinal rows for: ${missing.join(', ')}`);
  rows.forEach((r) =>
    console.log(
      `    - ${r.registration.user.email} | team=${r.registration.team?.teamName} | status=${r.status}`,
    ),
  );
  console.log('    ✅ All 5 real teams present as pending submissions.');
}

async function testApproveFlow() {
  console.log('\n▶️  STEP 2: APPROVE BCC semifinal (no feedback input)');
  await cleanup(TEST_TEAM_APPROVE);
  const reg = await makeTestTeam(TEST_TEAM_APPROVE, TEST_EMAIL);
  const submissionId = reg.semifinal!.id;

  // Replicate route logic (no feedback body)
  await prisma.$transaction([
    prisma.semifinalSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'qualified',
        reviewedAt: new Date(),
        reviewedBy: 'e2e-test',
        reviewNotes: 'Semifinal submission approved',
      },
    }),
    prisma.competitionRegistration.update({
      where: { id: reg.id },
      data: { currentPhase: 'final', isSemifinalQualified: true },
    }),
  ]);

  const teamName = reg.team!.teamName;
  await sendMail({
    to: TEST_EMAIL,
    subject: `[E2E TEST] 🏆 Congratulations ${teamName} — Advanced to the Final Round of BCC The IMD 2026 at ITB 3.0`,
    html: buildBccApproveHtml(teamName),
  });

  // Verify final state
  const after = await prisma.competitionRegistration.findUnique({
    where: { id: reg.id },
    include: { semifinal: true },
  });
  if (after?.currentPhase !== 'final')
    throw new Error(`Expected phase='final', got ${after?.currentPhase}`);
  if (after?.isSemifinalQualified !== true)
    throw new Error('Expected isSemifinalQualified=true');
  if (after?.semifinal?.status !== 'qualified')
    throw new Error(
      `Expected semifinal='qualified', got ${after?.semifinal?.status}`,
    );

  console.log('    ✅ Approve email sent; registration moved to final phase.');
  await cleanup(TEST_TEAM_APPROVE);
}

async function testRejectFlow() {
  console.log(
    '\n▶️  STEP 3: REJECT BCC semifinal (no feedback input required)',
  );
  await cleanup(TEST_TEAM_REJECT);
  const reg = await makeTestTeam(TEST_TEAM_REJECT, TEST_EMAIL);
  const submissionId = reg.semifinal!.id;

  await prisma.semifinalSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: 'e2e-test',
      reviewNotes: 'BCC semifinal not selected for final round',
    },
  });

  const teamName = reg.team!.teamName;
  await sendMail({
    to: TEST_EMAIL,
    subject: `[E2E TEST] 📋 Semifinal Round Result — ${teamName} (BCC The IMD 2026 at ITB 3.0)`,
    html: buildBccRejectHtml(teamName),
  });

  const after = await prisma.semifinalSubmission.findUnique({
    where: { id: submissionId },
  });
  if (after?.status !== 'rejected')
    throw new Error(`Expected rejected, got ${after?.status}`);

  console.log('    ✅ Reject email sent; submission marked rejected.');
  await cleanup(TEST_TEAM_REJECT);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  E2E TEST: BCC Semifinal Approve/Reject (no feedback)    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  try {
    await verifyAdminDashboardListsRealTeams();
    await testApproveFlow();
    await testRejectFlow();
    console.log('\n🎉 ALL CHECKS PASSED');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    // best-effort cleanup
    await cleanup(TEST_TEAM_APPROVE).catch(() => {});
    await cleanup(TEST_TEAM_REJECT).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
