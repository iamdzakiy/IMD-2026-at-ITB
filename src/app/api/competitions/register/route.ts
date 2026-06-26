/**
 * ============================================================================
 * COMPETITION REGISTRATION API ENDPOINT
 * ============================================================================
 *
 * POST /api/competitions/register
 *
 * Purpose: Register team for competition (PTC/TPC/BCC)
 *
 * Flow:
 * 1. Validate request data
 * 2. Check competition exists and active
 * 3. Validate team size for competition
 * 4. Check for duplicate emails (global uniqueness)
 * 5. Create User → CompetitionRegistration → Team → TeamMembers
 * 6. Sync to Google Sheets (non-blocking)
 * 7. Send email verification to leader
 * 8. Return success response
 *
 * ============================================================================
 */

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  calculateDiscountedFee,
  COMPETITION_PRICING,
  EVENT_DISCOUNT,
} from '@/lib/discount-config';
import { getFileUrl, uploadFile } from '@/lib/fileUpload';
import { appendToGoogleSheets } from '@/lib/google-sheets';
import { logger } from '@/lib/logger';
import {
  RATE_LIMITS,
  rateLimit,
  rateLimitByUser,
  refundRateLimit,
} from '@/lib/rate-limit';
import {
  acquireRegistrationLock,
  releaseRegistrationLock,
} from '@/lib/registration-lock';

// Zod schema for team member validation
const memberSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name must be at most 100 characters')
    .trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be at most 20 digits')
    .trim(),
  institution: z
    .string()
    .min(3, 'Institution name must be at least 3 characters')
    .max(200, 'Institution name must be at most 200 characters')
    .trim(),
  studentIdCard: z.string().optional(),
});

const membersArraySchema = z.array(memberSchema);

export async function POST(request: NextRequest) {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required. Please login first.' },
      { status: 401 },
    );
  }

  // Apply rate limiting (10 registrations per 10 minutes per IP)
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.REGISTRATION);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Per-user rate limiting (10 per 10 minutes per user — defense in depth)
  const userRateLimitResponse = await rateLimitByUser(
    request,
    session.user.email,
    RATE_LIMITS.USER_REGISTRATION,
    'registration',
  );
  if (userRateLimitResponse) {
    return userRateLimitResponse;
  }

  // Per-user registration lock — prevents concurrent duplicate submissions.
  // Lock key: registration:lock:${userId}. TTL: 30 seconds. Always released in finally.
  const userId = session.user.id || session.user.email;
  const lockAcquired = acquireRegistrationLock(userId);
  if (!lockAcquired) {
    return NextResponse.json(
      {
        error:
          'Registration is already being processed. Please wait a moment and try again.',
      },
      { status: 409 },
    );
  }

  const log = logger.child({
    operation: 'competition-registration',
    userId: session.user.email,
  });

  try {
    // Parse FormData (multipart) instead of JSON
    const formDataBody = await request.formData();

    const competitionCode = formDataBody.get('competitionCode') as string;
    const teamName = formDataBody.get('teamName') as string;
    const leaderName = formDataBody.get('leaderName') as string;
    const leaderPhone = formDataBody.get('leaderPhone') as string;
    const leaderInstitution = formDataBody.get('leaderInstitution') as string;
    const proofOfRegistrationLink = formDataBody.get(
      'proofOfRegistrationLink',
    ) as string;
    const membersJson = formDataBody.get('members') as string;
    const paymentProofFile = formDataBody.get('paymentProof') as File | null;

    // Validate required fields
    if (!competitionCode || !['PTC', 'TPC', 'BCC'].includes(competitionCode)) {
      return NextResponse.json(
        { error: 'Invalid competition code' },
        { status: 400 },
      );
    }
    if (!teamName || teamName.length < 3 || teamName.length > 50) {
      return NextResponse.json(
        { error: 'Team name must be 3-50 characters' },
        { status: 400 },
      );
    }
    if (!leaderName || leaderName.length < 3) {
      return NextResponse.json(
        { error: 'Leader name must be at least 3 characters' },
        { status: 400 },
      );
    }
    if (!leaderPhone || leaderPhone.length < 10) {
      return NextResponse.json(
        { error: 'Phone number must be at least 10 digits' },
        { status: 400 },
      );
    }
    if (!leaderInstitution || leaderInstitution.length < 3) {
      return NextResponse.json(
        { error: 'Leader institution name is required' },
        { status: 400 },
      );
    }
    if (
      !proofOfRegistrationLink ||
      !proofOfRegistrationLink.startsWith('http')
    ) {
      return NextResponse.json(
        {
          error: 'Proof of registration link is required (must be a valid URL)',
        },
        { status: 400 },
      );
    }

    // Check for presigned URL flow (payment proof already uploaded to Supabase)
    const paymentProofStoragePath = formDataBody.get(
      'paymentProofStoragePath',
    ) as string | null;

    if (!paymentProofStoragePath) {
      // Legacy flow: validate payment proof file sent via FormData
      if (
        !paymentProofFile ||
        !(paymentProofFile instanceof File) ||
        paymentProofFile.size === 0
      ) {
        return NextResponse.json(
          { error: 'Payment proof file is required' },
          { status: 400 },
        );
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(paymentProofFile.type)) {
        return NextResponse.json(
          { error: 'Payment proof must be JPG or PNG image' },
          { status: 400 },
        );
      }
      if (paymentProofFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Payment proof must be less than 5MB' },
          { status: 400 },
        );
      }
    }

    // Parse and validate members with Zod
    let members: z.infer<typeof membersArraySchema> = [];
    try {
      const parsed = JSON.parse(membersJson || '[]');
      const result = membersArraySchema.safeParse(parsed);
      if (!result.success) {
        const firstError = result.error.errors[0];
        return NextResponse.json(
          {
            error: `Invalid member data: ${firstError.path.join('.')} - ${firstError.message}`,
          },
          { status: 400 },
        );
      }
      members = result.data;
    } catch {
      return NextResponse.json(
        { error: 'Invalid members data format' },
        { status: 400 },
      );
    }

    // Use authenticated user's email as leader email
    const leaderEmail = session.user.email;

    // 1. Check if competition exists and is active
    const competition = await prisma.competition.findUnique({
      where: { code: competitionCode },
    });

    if (!competition) {
      return NextResponse.json(
        { error: `Competition ${competitionCode} not found` },
        { status: 404 },
      );
    }

    if (!competition.isActive) {
      return NextResponse.json(
        { error: 'Competition registration is closed' },
        { status: 400 },
      );
    }

    // Check registration window (date-based enforcement)
    const now = new Date();
    if (now < new Date(competition.registrationOpen)) {
      return NextResponse.json(
        {
          error:
            'Registration has not opened yet. Please check the competition timeline.',
        },
        { status: 400 },
      );
    }
    if (now > new Date(competition.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed.' },
        { status: 400 },
      );
    }

    // 2. Validate team size
    const totalMembers = members.length + 1; // +1 for leader

    if (
      totalMembers < competition.minTeamSize ||
      totalMembers > competition.maxTeamSize
    ) {
      return NextResponse.json(
        {
          error: `Team size must be between ${competition.minTeamSize} and ${competition.maxTeamSize} members`,
          current: totalMembers,
          min: competition.minTeamSize,
          max: competition.maxTeamSize,
        },
        { status: 400 },
      );
    }

    // 3. Check for duplicate team name (scoped to same competition)
    const existingTeam = await prisma.team.findFirst({
      where: {
        teamName,
        registration: {
          competitionId: competition.id,
        },
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        {
          error:
            'Team name already taken in this competition. Please choose another name.',
        },
        { status: 409 },
      );
    }

    // 4. Check if leader already registered (ONE user = ONE competition ONLY)
    const existingUser = await prisma.user.findUnique({
      where: { email: leaderEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        active: true,
        registration: {
          select: {
            id: true,
            competitionId: true,
            competition: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (existingUser?.registration) {
      // User already registered for a competition (ONE-TO-ONE constraint)
      return NextResponse.json(
        {
          error: `You are already registered for ${existingUser.registration.competition.name}. Each user can only register for one competition.`,
          existingCompetition: existingUser.registration.competition.code,
        },
        { status: 409 },
      );
    }

    // 5. Resolve payment proof URL
    let paymentProofUrl: string;
    if (paymentProofStoragePath) {
      // Presigned URL flow: file already uploaded, generate read URL
      paymentProofUrl = await getFileUrl('payments', paymentProofStoragePath);
    } else {
      // Legacy flow: upload payment proof via Supabase Storage
      const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
      const prefix = `payment_${sanitizedTeamName}`;
      const uploaded = await uploadFile(paymentProofFile!, 'payments', prefix);
      paymentProofUrl = uploaded.url;
    }

    // 7. Create CompetitionRegistration + Team + TeamMembers + Payment (Transaction)
    const registration = await prisma.$transaction(async (tx) => {
      // User is already authenticated and exists in database
      if (!existingUser) {
        throw new Error('User account not found. Please login again.');
      }

      const user = existingUser;

      // Determine batch-based fee
      const timelineEvents = await tx.competitionTimeline.findMany({
        where: { competitionId: competition.id },
      });
      const batch1 = timelineEvents.find(
        (e) => e.phase === 'registration_batch_1',
      );
      const batch2 = timelineEvents.find(
        (e) => e.phase === 'registration_batch_2',
      );
      let registrationFee = competition.registrationFee; // fallback to default

      if (batch1 && batch2 && COMPETITION_PRICING[competitionCode]) {
        const now = new Date();
        const batch1End = new Date(batch1.endDate);
        if (now <= batch1End) {
          registrationFee = COMPETITION_PRICING[competitionCode].early;
        } else {
          registrationFee = COMPETITION_PRICING[competitionCode].normal;
        }
      }

      // Check for event-based discount eligibility
      // User must have an APPROVED event registration for a qualifying event
      let discountApplied = false;
      let discountLabel = '';
      let originalFee = registrationFee;

      const approvedEventReg = await tx.eventRegistration.findFirst({
        where: {
          email: leaderEmail,
          eventCode: { in: EVENT_DISCOUNT.qualifyingEventCodes },
          verificationStatus: 'approved',
        },
        select: { id: true, eventCode: true },
      });

      if (approvedEventReg) {
        const { discountedFee, discountAmount } = calculateDiscountedFee(
          registrationFee,
          competitionCode,
        );
        if (discountAmount > 0) {
          originalFee = registrationFee;
          registrationFee = discountedFee;
          discountApplied = true;
          discountLabel = EVENT_DISCOUNT.label;
          log.info('Event discount applied', {
            originalFee,
            discountedFee,
            discountAmount,
            eventCode: approvedEventReg.eventCode,
          });
        }
      }

      // Create competition registration with team and members
      // Use orderIndex to guarantee member ordering: 0=leader, 1+=members
      const reg = await tx.competitionRegistration.create({
        data: {
          userId: user.id,
          competitionId: competition.id,
          verificationStatus: 'pending',
          currentPhase: 'registration',
          team: {
            create: {
              teamName,
              proofOfRegistrationLink,
              leaderUserId: user.id,
              members: {
                create: [
                  // Leader as first member (orderIndex 0)
                  {
                    fullName: leaderName,
                    email: leaderEmail.toLowerCase(),
                    phoneNumber: leaderPhone,
                    institution: leaderInstitution,
                    orderIndex: 0,
                  },
                  // Additional team members (orderIndex 1, 2, ...)
                  ...members.map((member, idx) => ({
                    fullName: member.fullName,
                    email: member.email.toLowerCase(),
                    phoneNumber: member.phoneNumber,
                    institution: member.institution,
                    studentIdCard: member.studentIdCard,
                    orderIndex: idx + 1,
                  })),
                ],
              },
            },
          },
        },
      });

      // Create Payment record with the uploaded proof
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: registrationFee,
          paymentProofUrl: paymentProofUrl,
          paymentMethod: 'QRIS',
          billName: leaderName,
          status: 'pending',
        },
      });

      return {
        reg,
        discountApplied,
        discountLabel,
        originalFee,
        finalFee: registrationFee,
      };
    });

    // Destructure transaction result
    const {
      reg: registrationRecord,
      discountApplied,
      discountLabel,
      originalFee,
      finalFee,
    } = registration;

    // Re-fetch the full registration with all relations for the response
    // (Separated from transaction to get proper TypeScript types)
    const fullRegistration =
      await prisma.competitionRegistration.findUniqueOrThrow({
        where: { id: registrationRecord.id },
        include: {
          competition: true,
          team: {
            include: {
              members: { orderBy: { orderIndex: 'asc' } },
            },
          },
        },
      });

    // 8. Sync to Google Sheets (non-blocking — fire and forget)
    appendToGoogleSheets({
      registrationId: fullRegistration.id,
      userId: fullRegistration.userId,
      competitionCode,
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      leaderInstitution,
      proofOfRegistrationLink,
      members: (fullRegistration.team?.members ?? []).slice(1), // Exclude leader
      verificationStatus: 'pending',
      currentPhase: 'registration',
    }).catch((sheetsErr) => {
      // Google Sheets sync is non-critical — never propagate this error
      console.error('⚠️ Google Sheets sync failed (non-blocking):', sheetsErr);
    });

    // 10. Return success response
    const responseBody = {
      success: true,
      message:
        'Registration successful! Your team is now pending admin review.',
      registration: {
        id: fullRegistration.id,
        teamName: fullRegistration.team?.teamName,
        competition: fullRegistration.competition.name,
        memberCount: fullRegistration.team?.members.length || 0,
        status: fullRegistration.verificationStatus,
        currentPhase: fullRegistration.currentPhase,
        needsActivation: false, // User is already active
        ...(discountApplied && {
          discountApplied: true,
          discountLabel,
          originalFee,
          finalFee,
        }),
      },
    };

    log.info('Registration completed successfully', {
      registrationId: fullRegistration.id,
      teamName: fullRegistration.team?.teamName,
      competitionCode,
      memberCount: fullRegistration.team?.members.length || 0,
    });

    return NextResponse.json(responseBody, { status: 201 });
  } catch (err) {
    logger.error(
      'Registration POST error',
      {
        operation: 'competition-registration',
        userId: session.user.email,
      },
      err,
    );

    // Refund rate limit tokens on server errors so 5xx doesn't penalise the user
    refundRateLimit(request, RATE_LIMITS.REGISTRATION);
    refundRateLimit(
      request,
      RATE_LIMITS.USER_REGISTRATION,
      `user:${session.user.email}`,
      'registration',
    );

    // Handle race condition: unique constraint violation from concurrent registration
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const target = (err.meta?.target as string[]) || [];
      if (target.includes('userId')) {
        return NextResponse.json(
          { error: 'You are already registered for a competition.' },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: 'Registration conflict. Please try again.' },
        { status: 409 },
      );
    }

    // Prisma known error - surface the message
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${err.code} — ${err.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Internal server error',
      },
      { status: 500 },
    );
  } finally {
    // ALWAYS release the registration lock — never leave it dangling
    releaseRegistrationLock(userId);
  }
}

// GET endpoint to check registration status (requires authentication)
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  // Users can only check their own registration status
  const email = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        active: true,
        registration: {
          select: {
            id: true,
            verificationStatus: true,
            currentPhase: true,
            competition: {
              select: { name: true, code: true },
            },
            team: {
              select: {
                teamName: true,
                members: {
                  select: { id: true },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.registration) {
      return NextResponse.json({ registered: false }, { status: 200 });
    }

    return NextResponse.json({
      registered: true,
      registration: {
        id: user.registration.id,
        teamName: user.registration.team?.teamName,
        competition: user.registration.competition.name,
        competitionCode: user.registration.competition.code,
        status: user.registration.verificationStatus,
        currentPhase: user.registration.currentPhase,
        memberCount: user.registration.team?.members.length || 0,
        isActive: user.active,
      },
    });
  } catch (err) {
    console.error('❌ Registration GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
