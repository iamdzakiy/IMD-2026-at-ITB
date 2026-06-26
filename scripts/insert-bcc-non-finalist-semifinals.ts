/**
 * ============================================================================
 * ONE-TIME ADMIN SCRIPT: Manual BCC Non-Finalist Semifinal Insertion
 * ============================================================================
 *
 * Purpose: Create placeholder SemifinalSubmission records for BCC teams that
 * submitted semifinal work manually to panitia but did NOT advance to finals.
 * These teams had no semifinal row, so admin couldn't reject them.
 *
 * Idempotent: skips teams that already have a semifinal submission.
 * Skips simulation records (team name starts with __SIM__) and any
 * simulation email domain.
 *
 * Usage: npx tsx scripts/insert-bcc-non-finalist-semifinals.ts
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const TEAM_EMAILS = [
  'adenayosamuel@gmail.com', // GX Strategists
  'rafafaizmarizqa@gmail.com', // GACORRR
];

async function main() {
  console.log(
    '🔎 Inserting manual BCC non-finalist semifinal submissions...\n',
  );

  let created = 0;
  let skipped = 0;
  let errored = 0;

  for (const email of TEAM_EMAILS) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          registration: {
            include: {
              team: true,
              competition: true,
              semifinal: true,
            },
          },
        },
      });

      if (!user) {
        console.warn(`  ⚠️  [${email}] user not found — skipping`);
        errored++;
        continue;
      }
      if (!user.registration) {
        console.warn(`  ⚠️  [${email}] no registration — skipping`);
        errored++;
        continue;
      }
      if (user.registration.competition.code !== 'BCC') {
        console.warn(
          `  ⚠️  [${email}] not BCC (${user.registration.competition.code}) — skipping`,
        );
        errored++;
        continue;
      }

      const teamName = user.registration.team?.teamName ?? '(no team)';

      if (
        teamName.startsWith('__SIM__') ||
        email.includes('simulation.imd 2026 at itb.internal')
      ) {
        console.log(`  ⏭️  [${email}] simulation record — skipped`);
        skipped++;
        continue;
      }

      if (user.registration.semifinal) {
        console.log(
          `  ⏭️  [${email}] team "${teamName}" already has semifinal (${user.registration.semifinal.status}) — skipped`,
        );
        skipped++;
        continue;
      }

      await prisma.semifinalSubmission.create({
        data: {
          registrationId: user.registration.id,
          competitionType: 'BCC',
          businessPlanUrl: null,
          pitchDeckUrl: null,
          status: 'pending',
          reviewNotes:
            'Submitted manually to panitia (website submission failed) — non-finalist',
        },
      });

      console.log(
        `  ✅ [${email}] team "${teamName}" — pending semifinal submission created`,
      );
      created++;
    } catch (err) {
      console.error(`  ❌ [${email}] failed:`, err);
      errored++;
    }
  }

  console.log(
    `\nDone. created=${created} skipped=${skipped} errored=${errored}\n`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
