import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SIM_MARKER = '__SIM__';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.admin || session.admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { competitionCode } = await req.json();
    if (!['BCC', 'PTC', 'TPC'].includes(competitionCode)) {
      return NextResponse.json(
        { error: 'Invalid competition code' },
        { status: 400 },
      );
    }

    const competition = await prisma.competition.findUnique({
      where: { code: competitionCode },
    });
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 },
      );
    }

    const ts = Date.now();
    const simId = ts.toString(36);
    const email = `sim-${competitionCode.toLowerCase()}-${simId}@simulation.imd 2026 at itb.internal`;
    const teamName = `${SIM_MARKER}${competitionCode}__${simId}`;

    // Create simulation user + registration + team in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: `__sim_${simId}`,
          name: `[SIM] ${competitionCode} Admin Preview`,
          email,
          active: true,
          emailVerified: new Date(),
        },
      });

      const registration = await tx.competitionRegistration.create({
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
                    fullName: `[SIM] ${session.admin!.username}`,
                    email,
                    phoneNumber: '000000000000',
                    institution: 'Admin Simulation',
                    orderIndex: 0,
                  },
                ],
              },
            },
          },
        },
        include: { team: true },
      });

      return { user, registration };
    });

    return NextResponse.json({
      success: true,
      simulationId: simId,
      registrationId: result.registration.id,
      userId: result.user.id,
      teamName,
      competitionCode,
      competitionName: competition.name,
      storagePrefix: `simulation/${simId}`,
    });
  } catch (error) {
    console.error('[Simulate/start] error:', error);
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 },
    );
  }
}
