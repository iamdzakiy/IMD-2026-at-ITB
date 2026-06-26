/**
 * ============================================================================
 * THE IMD 2026 at ITB 3.0 - DATABASE SEED SCRIPT
 * ============================================================================
 *
 * Seeds:
 * 1. Competition configurations (PTC, TPC, BCC) with correct 2026 timelines
 * 2. Detailed timeline events for each competition
 * 3. Initial Super Admin account
 *
 * Usage:
 *   npx prisma db seed
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// All dates in WIB (UTC+7) — Jakarta timezone
const wib = (dateStr: string) => new Date(`${dateStr}+07:00`);

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // 1. Seed Competition Configurations
  // ============================================================================
  console.log('📋 Seeding Competition configurations...');

  // ------ OMM (Olympiad of Microbiology) ------
  const omm = await prisma.competition.upsert({
    where: { code: 'OMM' },
    update: {
      name: 'Olympiad of Microbiology',
      description:
        'Olympiad of Microbiology (OMM) is a national-level competition that challenges students to demonstrate their understanding of microbiology concepts, laboratory techniques, and real-world applications. Participants engage in a series of tests, including written exams and practical challenges, to showcase their expertise in the field of microbiology.',
      registrationOpen: wib('2026-02-22T00:00:00'),
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-18T23:59:59'),
      semifinalStart: wib('2026-03-23T00:00:00'),
      semifinalDeadline: wib('2026-03-30T23:59:59'),
      finalStart: wib('2026-04-04T00:00:00'),
      finalDeadline: wib('2026-04-24T23:59:59'),
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 200000,
      minTeamSize: 1,
      maxTeamSize: 3,
      isActive: true,
    },
    create: {
      code: 'OMM',
      name: 'Olympiad of Microbiology',
      description:
        'Olympiad of Microbiology (OMM) is a national-level competition that challenges students to demonstrate their understanding of microbiology concepts, laboratory techniques, and real-world applications. Participants engage in a series of tests, including written exams and practical challenges, to showcase their expertise in the field of microbiology.',
      registrationOpen: wib('2026-02-22T00:00:00'),
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-18T23:59:59'),
      semifinalStart: wib('2026-03-23T00:00:00'),
      semifinalDeadline: wib('2026-03-30T23:59:59'),
      finalStart: wib('2026-04-04T00:00:00'),
      finalDeadline: wib('2026-04-24T23:59:59'),
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 200000,
      minTeamSize: 1,
      maxTeamSize: 3,
      isActive: true,
    },
  });
  console.log('  ✅ OMM created:', omm.name);

  // ------ SPC (Science Project Competition) ------
  const spc = await prisma.competition.upsert({
    where: { code: 'SPC' },
    update: {
      name: 'Science Project Competition',
      description:
        'Science Project Competition (SPC) is a national-level event that invites students to develop and present innovative science projects. Participants work in teams to design experiments, analyze data, and demonstrate their projects to a panel of judges. The competition encourages creativity, scientific rigor, and effective communication of results.',
      registrationOpen: wib('2026-02-22T00:00:00'),
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-19T23:59:59'),
      semifinalStart: wib('2026-03-24T00:00:00'),
      semifinalDeadline: wib('2026-04-11T23:59:59'),
      finalStart: null,
      finalDeadline: null,
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 150000,
      minTeamSize: 2,
      maxTeamSize: 4,
      isActive: true,
    },
    create: {
      code: 'SPC',
      name: 'Science Project Competition',
      description:
        'Science Project Competition (SPC) is a national-level event that invites students to develop and present innovative science projects. Participants work in teams to design experiments, analyze data, and demonstrate their projects to a panel of judges. The competition encourages creativity, scientific rigor, and effective communication of results.',
      registrationOpen: wib('2026-02-22T00:00:00'),
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-19T23:59:59'),
      semifinalStart: wib('2026-03-24T00:00:00'),
      semifinalDeadline: wib('2026-04-11T23:59:59'),
      finalStart: null,
      finalDeadline: null,
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 150000,
      minTeamSize: 2,
      maxTeamSize: 4,
      isActive: true,
    },
  });
  console.log('  ✅ SPC created:', spc.name);

  // ------ NEC (National Essay Competition) ------
  const nec = await prisma.competition.upsert({
    where: { code: 'NEC' },
    update: {
      name: 'National Essay Competition',
      description:
        'National Essay Competition (NEC) is a competition that challenges students to write compelling essays on topics related to science, technology, and society. Participants are required to produce well-argued, evidence-based essays that demonstrate critical thinking, clarity of expression, and a deep understanding of the chosen subject. The competition aims to promote scientific literacy and effective communication.',
      registrationOpen: wib('2026-02-22T00:00:00'),
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-19T23:59:59'),
      semifinalStart: wib('2026-03-24T00:00:00'),
      semifinalDeadline: wib('2026-04-04T23:59:59'),
      finalStart: wib('2026-04-16T00:00:00'),
      finalDeadline: wib('2026-04-22T23:59:59'),
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 100000,
      minTeamSize: 1,
      maxTeamSize: 1,
      isActive: true,
    },
    create: {
      code: 'NEC',
      name: 'National Essay Competition',
      description:
        'National Essay Competition (NEC) is a competition that challenges students to write compelling essays on topics related to science, technology, and society. Participants are required to produce well-argued, evidence-based essays that demonstrate critical thinking, clarity of expression, and a deep understanding of the chosen subject. The competition aims to promote scientific literacy and effective communication.',
      registrationOpen: wib('2026-02-23T00:00:00'), // adjust as needed
      registrationDeadline: wib('2026-03-16T23:59:59'),
      preliminaryStart: wib('2026-02-23T00:00:00'),
      preliminaryDeadline: wib('2026-03-19T23:59:59'),
      semifinalStart: wib('2026-03-24T00:00:00'),
      semifinalDeadline: wib('2026-04-04T23:59:59'),
      finalStart: wib('2026-04-16T00:00:00'),
      finalDeadline: wib('2026-04-22T23:59:59'),
      grandFinalDate: wib('2026-04-25T00:00:00'),
      registrationFee: 100000,
      minTeamSize: 1,
      maxTeamSize: 1,
      isActive: true,
    },
  });
  console.log('  ✅ NEC created:', nec.name);

  // ============================================================================
  // 2. Seed Timeline Events
  // ============================================================================
  console.log('\n📅 Seeding Timeline events...');

  // Clear existing timeline events
  await prisma.competitionTimeline.deleteMany({});

  // --- PTC Timeline ---
  const ptcTimeline = [
    {
      phase: 'registration_batch_1',
      label: 'Open Registration Batch 1',
      startDate: '2026-02-22T00:00:00',
      endDate: '2026-02-28T23:59:59',
      sortOrder: 1,
      phaseType: 'registration',
    },
    {
      phase: 'registration_batch_2',
      label: 'Late Registration',
      startDate: '2026-03-10T00:00:00',
      endDate: '2026-03-16T23:59:59',
      sortOrder: 2,
      phaseType: 'registration',
    },
    {
      phase: 'preliminary',
      label: 'Abstract Submission',
      startDate: '2026-02-23T00:00:00',
      endDate: '2026-03-18T23:59:59',
      sortOrder: 3,
      phaseType: 'submission',
    },
    {
      phase: 'semifinalist_announcement',
      label: 'Semifinalist Announcement',
      startDate: '2026-03-22T00:00:00',
      endDate: '2026-03-22T23:59:59',
      sortOrder: 4,
      phaseType: 'announcement',
    },
    {
      phase: 'semifinal',
      label: 'Semifinal Phase',
      startDate: '2026-03-23T00:00:00',
      endDate: '2026-03-30T23:59:59',
      sortOrder: 5,
      phaseType: 'submission',
    },
    {
      phase: 'finalist_announcement',
      label: 'Finalist Announcement',
      startDate: '2026-04-03T00:00:00',
      endDate: '2026-04-03T23:59:59',
      sortOrder: 6,
      phaseType: 'announcement',
    },
    {
      phase: 'final',
      label: 'Final Phase',
      startDate: '2026-04-04T00:00:00',
      endDate: '2026-04-24T23:59:59',
      sortOrder: 7,
      phaseType: 'submission',
    },
    {
      phase: 'grand_final',
      label: 'Grand Final and Awarding',
      startDate: '2026-04-25T00:00:00',
      endDate: '2026-04-25T23:59:59',
      sortOrder: 8,
      phaseType: 'event',
    },
  ];

  for (const event of ptcTimeline) {
    await prisma.competitionTimeline.create({
      data: {
        competitionId: ptc.id,
        phase: event.phase,
        label: event.label,
        startDate: wib(event.startDate),
        endDate: wib(event.endDate),
        sortOrder: event.sortOrder,
        phaseType: event.phaseType,
      },
    });
  }
  console.log(`  ✅ PTC: ${ptcTimeline.length} timeline events`);

  // --- TPC Timeline ---
  const tpcTimeline = [
    {
      phase: 'registration_batch_1',
      label: 'Open Registration Batch 1',
      startDate: '2026-02-22T00:00:00',
      endDate: '2026-02-28T23:59:59',
      sortOrder: 1,
      phaseType: 'registration',
    },
    {
      phase: 'registration_batch_2',
      label: 'Late Registration',
      startDate: '2026-03-10T00:00:00',
      endDate: '2026-03-16T23:59:59',
      sortOrder: 2,
      phaseType: 'registration',
    },
    {
      phase: 'preliminary',
      label: 'Preliminary Abstract Submission',
      startDate: '2026-02-23T00:00:00',
      endDate: '2026-03-19T23:59:59',
      sortOrder: 3,
      phaseType: 'submission',
    },
    {
      phase: 'semifinalist_announcement',
      label: 'Semifinalist Announcement',
      startDate: '2026-03-23T00:00:00',
      endDate: '2026-03-23T23:59:59',
      sortOrder: 4,
      phaseType: 'announcement',
    },
    {
      phase: 'semifinal',
      label: 'Semifinal Phase',
      startDate: '2026-03-24T00:00:00',
      endDate: '2026-04-11T23:59:59',
      sortOrder: 5,
      phaseType: 'submission',
    },
    {
      phase: 'finalist_announcement',
      label: 'Finalist Announcement',
      startDate: '2026-04-16T00:00:00',
      endDate: '2026-04-16T23:59:59',
      sortOrder: 6,
      phaseType: 'announcement',
    },
    {
      phase: 'coaching',
      label: 'Coaching',
      startDate: '2026-04-18T00:00:00',
      endDate: '2026-04-18T23:59:59',
      sortOrder: 7,
      phaseType: 'event',
    },
    {
      phase: 'grand_final',
      label: 'Grand Final',
      startDate: '2026-04-25T00:00:00',
      endDate: '2026-04-25T23:59:59',
      sortOrder: 8,
      phaseType: 'event',
    },
  ];

  for (const event of tpcTimeline) {
    await prisma.competitionTimeline.create({
      data: {
        competitionId: tpc.id,
        phase: event.phase,
        label: event.label,
        startDate: wib(event.startDate),
        endDate: wib(event.endDate),
        sortOrder: event.sortOrder,
        phaseType: event.phaseType,
      },
    });
  }
  console.log(`  ✅ TPC: ${tpcTimeline.length} timeline events`);

  // --- BCC Timeline ---
  const bccTimeline = [
    {
      phase: 'registration_batch_1',
      label: 'Open Registration Batch 1',
      startDate: '2026-02-22T00:00:00',
      endDate: '2026-02-28T23:59:59',
      sortOrder: 1,
      phaseType: 'registration',
    },
    {
      phase: 'registration_batch_2',
      label: 'Late Registration',
      startDate: '2026-03-10T00:00:00',
      endDate: '2026-03-16T23:59:59',
      sortOrder: 2,
      phaseType: 'registration',
    },
    {
      phase: 'preliminary',
      label: 'Preliminary Abstract Submission',
      startDate: '2026-02-23T00:00:00',
      endDate: '2026-03-19T23:59:59',
      sortOrder: 3,
      phaseType: 'submission',
    },
    {
      phase: 'semifinalist_announcement',
      label: 'Semifinalist Announcement',
      startDate: '2026-03-23T00:00:00',
      endDate: '2026-03-23T23:59:59',
      sortOrder: 4,
      phaseType: 'announcement',
    },
    {
      phase: 'semifinal',
      label: 'Semifinal Phase',
      startDate: '2026-03-24T00:00:00',
      endDate: '2026-04-04T23:59:59',
      sortOrder: 5,
      phaseType: 'submission',
    },
    {
      phase: 'coaching',
      label: 'Coaching',
      startDate: '2026-03-27T00:00:00',
      endDate: '2026-03-27T23:59:59',
      sortOrder: 6,
      phaseType: 'event',
    },
    {
      phase: 'finalist_announcement',
      label: 'Finalist Announcement',
      startDate: '2026-04-15T00:00:00',
      endDate: '2026-04-15T23:59:59',
      sortOrder: 7,
      phaseType: 'announcement',
    },
    {
      phase: 'mentoring',
      label: 'Mentoring Session',
      startDate: '2026-04-16T00:00:00',
      endDate: '2026-04-19T23:59:59',
      sortOrder: 8,
      phaseType: 'event',
    },
    {
      phase: 'final',
      label: 'Final Phase',
      startDate: '2026-04-16T00:00:00',
      endDate: '2026-04-22T23:59:59',
      sortOrder: 9,
      phaseType: 'submission',
    },
    {
      phase: 'pitch_deck_submission',
      label: 'Pitch Deck Submission',
      startDate: '2026-04-22T00:00:00',
      endDate: '2026-04-22T23:59:59',
      sortOrder: 10,
      phaseType: 'submission',
    },
    {
      phase: 'technical_meeting',
      label: 'Technical Meeting',
      startDate: '2026-04-23T00:00:00',
      endDate: '2026-04-23T23:59:59',
      sortOrder: 11,
      phaseType: 'event',
    },
    {
      phase: 'grand_final',
      label: 'Grand Final and Awarding',
      startDate: '2026-04-25T00:00:00',
      endDate: '2026-04-25T23:59:59',
      sortOrder: 12,
      phaseType: 'event',
    },
  ];

  for (const event of bccTimeline) {
    await prisma.competitionTimeline.create({
      data: {
        competitionId: bcc.id,
        phase: event.phase,
        label: event.label,
        startDate: wib(event.startDate),
        endDate: wib(event.endDate),
        sortOrder: event.sortOrder,
        phaseType: event.phaseType,
      },
    });
  }
  console.log(`  ✅ BCC: ${bccTimeline.length} timeline events`);

  // ============================================================================
  // 3. Seed Initial Super Admin
  // ============================================================================
  console.log('\n👤 Seeding Super Admin account...');

  const SUPER_ADMIN_PASSWORD = 'SuperAdmin2026!';
  const hashedPassword = await hash(SUPER_ADMIN_PASSWORD, 10);

  const superAdmin = await prisma.admin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'fadzaro10@gmail.com',
      password: hashedPassword,
      adminRole: 'super_admin',
      isActive: true,
    },
  });

  console.log('  ✅ Super Admin created:', superAdmin.username);
  console.log('\n✨ Database seed completed successfully!');
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
