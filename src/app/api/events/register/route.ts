/**
 * ============================================================================
 * EVENT REGISTRATION API ENDPOINT
 * ============================================================================
 *
 * POST /api/events/register — Register for an event (YIF & Grand Seminar)
 * GET  /api/events/register — Check current user's event registration status
 *
 * Flow (free registration — no payment required):
 * 1. Validate request data (personal info only)
 * 2. Check event exists (via event-content.ts)
 * 3. Check for duplicate registration (one per event per user)
 * 4. Create EventRegistration with status 'approved' (instant confirmation)
 * 5. Send confirmation email (non-blocking)
 * 6. Return success response
 *
 * ============================================================================
 */

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEventRegistrationConfirmationEmail } from '@/lib/email';
import { getEventContent } from '@/lib/event-content';
import {
  RATE_LIMITS,
  rateLimit,
  rateLimitByUser,
  refundRateLimit,
} from '@/lib/rate-limit';

// Zod schema for event registration validation
const eventRegistrationSchema = z.object({
  eventCode: z.string().min(1, 'Event code is required'),
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
});

export async function POST(request: NextRequest) {
  // Auth required
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required. Please login first.' },
      { status: 401 },
    );
  }

  // Rate limiting
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.REGISTRATION);
  if (rateLimitResponse) return rateLimitResponse;

  const userRateLimitResponse = await rateLimitByUser(
    request,
    session.user.email,
    RATE_LIMITS.USER_REGISTRATION,
    'event-registration',
  );
  if (userRateLimitResponse) return userRateLimitResponse;

  try {
    // Parse FormData
    const formDataBody = await request.formData();

    const eventCode = formDataBody.get('eventCode') as string;
    const fullName = formDataBody.get('fullName') as string;
    const email = formDataBody.get('email') as string;
    const phoneNumber = formDataBody.get('phoneNumber') as string;
    const institution = formDataBody.get('institution') as string;

    // Validate event exists
    const eventContent = getEventContent(eventCode);
    if (!eventContent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Validate fields with Zod
    const validationResult = eventRegistrationSchema.safeParse({
      eventCode,
      fullName,
      email,
      phoneNumber,
      institution,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: `${firstError.path.join('.')}: ${firstError.message}` },
        { status: 400 },
      );
    }

    // Check duplicate registration
    const userId = session.user.id;
    if (userId) {
      const existing = await prisma.eventRegistration.findFirst({
        where: {
          userId,
          eventCode,
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'You are already registered for this event.' },
          { status: 409 },
        );
      }
    }

    // Create EventRegistration — instantly approved (free registration, no payment)
    const registration = await prisma.eventRegistration.create({
      data: {
        userId: userId || null,
        eventCode,
        fullName: validationResult.data.fullName,
        email: validationResult.data.email,
        phoneNumber: validationResult.data.phoneNumber,
        institution: validationResult.data.institution,
        verificationStatus: 'approved',
      },
    });

    // Send confirmation email (non-blocking)
    const eventName =
      eventCode === 'yif-x-grand-seminar' ? 'YIF x Grand Seminar' : eventCode;

    sendEventRegistrationConfirmationEmail(
      registration.email,
      registration.fullName,
      eventName,
    ).catch((emailErr) => {
      console.error(
        '⚠️ Event registration confirmation email failed (non-blocking):',
        emailErr,
      );
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Registration successful! You are now registered for this event.',
        registration: {
          id: registration.id,
          eventCode,
          fullName: registration.fullName,
          status: registration.verificationStatus,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('❌ Event registration error:', err);

    refundRateLimit(request, RATE_LIMITS.REGISTRATION);
    refundRateLimit(
      request,
      RATE_LIMITS.USER_REGISTRATION,
      `user:${session.user.email}`,
      'event-registration',
    );

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'You are already registered for this event.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

// GET endpoint to check event registration status
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const userId = session.user.id;

    const registrations = await prisma.eventRegistration.findMany({
      where: { userId },
      select: {
        id: true,
        eventCode: true,
        fullName: true,
        verificationStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      registrations,
    });
  } catch (err) {
    console.error('❌ Event registration GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
