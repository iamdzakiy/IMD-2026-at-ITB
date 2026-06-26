import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { sendActivationEmail } from '@/lib/email';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';

/**
 * ============================================================================
 * USER REGISTRATION API ENDPOINT
 * ============================================================================
 * POST /api/auth/register
 *
 * Purpose: Register new user account and send email verification
 *
 * Access: Public
 *
 * Request Body:
 * {
 *   email: string,
 *   password: string,
 *   name: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Registration successful. Please check your email to activate your account.",
 *   user: { id, username, email, name }
 * }
 * ============================================================================
 */

const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.AUTH);
    if (rateLimitResponse) return rateLimitResponse;

    // ============================================================================
    // 1. Validate Request Body
    // ============================================================================
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { email, password, name } = validatedData;

    // ============================================================================
    // 2. Generate unique username from email
    // ============================================================================
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // ============================================================================
    // 3. Check for Existing User
    // ============================================================================
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 },
      );
    }

    // ============================================================================
    // 4. Hash Password
    // ============================================================================
    const hashedPassword = await hash(password, 10);

    // ============================================================================
    // 5. Create User Account (not activated yet)
    // ============================================================================
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        active: false, // User must verify email first
        emailVerified: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // ============================================================================
    // 5. Generate Activation Token (expires in 24 hours)
    // ============================================================================
    const activationToken = crypto.randomBytes(32).toString('hex');

    await prisma.activateToken.create({
      data: {
        token: activationToken,
        userId: newUser.id,
      },
    });

    // ============================================================================
    // 6. Send Activation Email
    // ============================================================================
    try {
      await sendActivationEmail(email, name, activationToken);
    } catch {
      // Don't fail registration if email fails - user can request new token
    }

    // ============================================================================
    // 7. Send Success Response
    // ============================================================================
    return NextResponse.json(
      {
        success: true,
        message:
          'Registration successful. Please check your email to activate your account.',
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    // ============================================================================
    // Error Handling
    // ============================================================================

    // Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    // Handle race condition: duplicate email/username caught by DB unique constraint
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 },
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
