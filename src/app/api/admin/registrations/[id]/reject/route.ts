/**
 * ============================================================================
 * ADMIN API - REJECT COMPETITION REGISTRATION
 * ============================================================================
 *
 * POST /api/admin/registrations/[id]/reject
 *
 * Purpose: Reject a pending competition registration and send notification email
 * Auth: Requires admin session (super_admin or moderator)
 *
 * Request Body:
 * {
 *   reason: string  // Reason for rejection (sent to user)
 * }
 *
 * Flow:
 * 1. Verify admin authentication
 * 2. Find registration by ID
 * 3. Update verificationStatus to 'rejected'
 * 4. Send rejection email to team leader
 * 5. Return success response
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

import { rejectRegistrationSchema } from '@/lib/admin-schemas';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendRegistrationRejectedEmail } from '@/lib/email';
import { logSubmissionToSheets } from '@/lib/google-sheets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ============================================================================
    // 1. AUTHENTICATION CHECK
    // ============================================================================
    const session = await auth();

    if (!session?.admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      );
    }

    // Only super_admin and moderator can reject registrations
    if (!['super_admin', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 },
      );
    }

    // ============================================================================
    // 2. PARSE REQUEST BODY
    // ============================================================================
    const body = await request.json();
    const parsed = rejectRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { reason } = parsed.data;

    const { id: registrationId } = await params;

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 },
      );
    }

    // ============================================================================
    // 3. FIND REGISTRATION WITH RELATIONS
    // ============================================================================
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        competition: true,
        team: {
          include: {
            members: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      );
    }

    // Check if already rejected
    if (registration.verificationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Registration is already rejected' },
        { status: 400 },
      );
    }

    // Check if already approved
    if (registration.verificationStatus === 'approved') {
      return NextResponse.json(
        { error: 'Cannot reject an approved registration' },
        { status: 400 },
      );
    }

    // ============================================================================
    // 4. UPDATE VERIFICATION STATUS
    // ============================================================================
    const updatedRegistration = await prisma.competitionRegistration.update({
      where: { id: registrationId },
      data: {
        verificationStatus: 'rejected',
        rejectionReason: reason.trim(),
        updatedAt: new Date(),
      },
    });

    // ============================================================================
    // 5. SEND REJECTION EMAIL
    // ============================================================================
    try {
      const leaderName =
        registration.team?.members?.[0]?.fullName ||
        registration.user.name ||
        registration.user.username;
      await sendRegistrationRejectedEmail(
        registration.user.email,
        leaderName,
        registration.team?.teamName || 'Your Team',
        reason.trim(),
      );

      console.log(`✅ Rejection email sent to ${registration.user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send rejection email:', emailError);
      // Don't fail the request if email fails - rejection still succeeded
    }

    // Log to Google Sheets (non-blocking)
    try {
      await logSubmissionToSheets({
        teamName: registration.team?.teamName || 'N/A',
        leaderEmail: registration.user.email,
        competitionCode: registration.competition.code,
        submissionPhase: 'preliminary',
        status: 'registration_rejected',
        reviewedBy: session.admin.username || session.admin.email || 'admin',
        reviewNotes: `Registration rejected: ${reason.trim()}`,
      });
    } catch (sheetsError) {
      console.warn(
        '⚠️ Google Sheets sync failed for registration rejection:',
        sheetsError,
      );
    }

    // ============================================================================
    // 6. RETURN SUCCESS RESPONSE
    // ============================================================================
    return NextResponse.json(
      {
        success: true,
        message: 'Registration rejected successfully',
        data: {
          registrationId: updatedRegistration.id,
          verificationStatus: updatedRegistration.verificationStatus,
          teamName: registration.team?.teamName,
          userEmail: registration.user.email,
          reason: reason.trim(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Error rejecting registration:', error);

    return NextResponse.json(
      { error: 'Failed to reject registration' },
      { status: 500 },
    );
  }
}
