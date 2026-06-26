/**
 * Test endpoint to verify SMTP configuration
 * GET /api/test-email?to=email@example.com
 *
 * ⚠️ PROTECTED: Requires super_admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  // Only allow in development or for super_admin
  const session = await auth();
  if (!session?.admin || session.admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json(
      { error: 'Please provide "to" email parameter' },
      { status: 400 },
    );
  }

  try {
    await sendActivationEmail(to, 'Test User', 'test-token-123');

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}. Check your inbox (and spam folder).`,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
