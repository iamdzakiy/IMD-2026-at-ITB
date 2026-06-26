import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateFileServer } from '@/lib/fileConfig';
import { deleteFile, getFileUrl, uploadFile } from '@/lib/fileUpload';
import { logSubmissionToSheets } from '@/lib/google-sheets';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';

/**
 * ============================================================================
 * PRELIMINARY SUBMISSION API
 * ============================================================================
 *
 * POST - Submit preliminary work
 *   Accepts two modes:
 *   - JSON body with { storagePath, fileName, fileSize, registrationId, competitionCode }
 *     → File already uploaded via presigned URL (recommended)
 *   - FormData with file field
 *     → Legacy server-side upload (limited by Vercel 4.5MB body limit)
 *
 * DELETE - Delete preliminary submission (before deadline)
 * ============================================================================
 */

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit(req, RATE_LIMITS.API);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Detect request type: JSON (presigned URL flow) or FormData (legacy)
    const contentType = req.headers.get('content-type') || '';
    const isJsonBody = contentType.includes('application/json');

    let registrationId: string;
    let competitionCode: string;
    let fileUrl: string;
    let fileName: string;
    let fileSize: number;
    let legacyFile: File | null = null;

    if (isJsonBody) {
      // ── Presigned URL flow: file already uploaded to Supabase ──
      const body = await req.json();
      registrationId = body.registrationId;
      competitionCode = body.competitionCode;
      fileName = body.fileName;
      fileSize = body.fileSize;
      fileUrl = ''; // Will be generated from storagePath below

      if (!registrationId) {
        return NextResponse.json(
          { error: 'Registration ID is required' },
          { status: 400 },
        );
      }

      if (!body.storagePath) {
        return NextResponse.json(
          { error: 'Storage path is required (file must be uploaded first)' },
          { status: 400 },
        );
      }

      if (!fileName || typeof fileSize !== 'number') {
        return NextResponse.json(
          { error: 'File metadata is required (fileName, fileSize)' },
          { status: 400 },
        );
      }

      // Generate signed read URL from the storage path
      fileUrl = await getFileUrl('preliminary', body.storagePath);
    } else {
      // ── Legacy FormData flow: file uploaded through server ──
      const formData = await req.formData();
      legacyFile = formData.get('file') as File | null;
      registrationId = formData.get('registrationId') as string;
      competitionCode = formData.get('competitionCode') as string;

      if (!registrationId) {
        return NextResponse.json(
          { error: 'Registration ID is required' },
          { status: 400 },
        );
      }

      if (!legacyFile || !(legacyFile instanceof File)) {
        return NextResponse.json(
          { error: 'A PDF file is required' },
          { status: 400 },
        );
      }

      // Server-side file validation
      const validation = validateFileServer(legacyFile, 'preliminary');
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      fileName = legacyFile.name;
      fileSize = legacyFile.size;
      fileUrl = ''; // Will be set after upload below
    }

    // Verify registration belongs to user
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        competition: true,
        team: {
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    if (!registration || registration.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      );
    }

    // Check if deadline passed
    if (new Date() > new Date(registration.competition.preliminaryDeadline)) {
      return NextResponse.json(
        { error: 'Deadline has passed' },
        { status: 400 },
      );
    }

    // Check if preliminary phase has started
    if (new Date() < new Date(registration.competition.preliminaryStart)) {
      return NextResponse.json(
        { error: 'Preliminary submission period has not started yet' },
        { status: 400 },
      );
    }

    // Check if registration is approved
    if (registration.verificationStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Registration must be approved first' },
        { status: 400 },
      );
    }

    // Delete old file if re-submitting
    const existing = await prisma.preliminarySubmission.findUnique({
      where: { registrationId },
    });
    if (existing?.fileUrl) {
      await deleteFile(existing.fileUrl);
    }

    // For legacy flow: upload file to Supabase Storage now
    if (!isJsonBody && legacyFile) {
      const teamName = registration.team?.teamName || 'team';
      const prefix = `${competitionCode}-${teamName}`.replace(
        /[^a-zA-Z0-9-]/g,
        '_',
      );
      const uploaded = await uploadFile(legacyFile, 'preliminary', prefix);
      fileUrl = uploaded.url;
    }

    // Create or update preliminary submission
    const submission = await prisma.preliminarySubmission.upsert({
      where: { registrationId },
      create: {
        registrationId,
        fileUrl,
        fileName,
        fileSize,
        status: 'pending',
      },
      update: {
        fileUrl,
        fileName,
        fileSize,
        status: 'pending',
        submittedAt: new Date(),
      },
    });

    // Log to Google Sheets (non-blocking)
    try {
      await logSubmissionToSheets({
        teamName: registration.team?.teamName || 'N/A',
        leaderEmail: registration.user.email,
        competitionCode: registration.competition.code,
        submissionPhase: 'preliminary',
        fileUrl,
        fileName,
        status: 'submitted',
        reviewNotes: 'Preliminary submission received',
      });
    } catch (sheetsError) {
      console.warn(
        '⚠️ Google Sheets sync failed for preliminary:',
        sheetsError,
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Preliminary submission uploaded successfully',
    });
  } catch (error: any) {
    console.error('Preliminary submission error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 },
      );
    }

    // Verify submission belongs to user
    const submission = await prisma.preliminarySubmission.findUnique({
      where: { id: submissionId },
      include: {
        registration: {
          include: {
            user: true,
            competition: true,
          },
        },
      },
    });

    if (
      !submission ||
      submission.registration.user.email !== session.user.email
    ) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    // Check if deadline passed
    if (
      new Date() >
      new Date(submission.registration.competition.preliminaryDeadline)
    ) {
      return NextResponse.json(
        { error: 'Cannot delete after deadline' },
        { status: 400 },
      );
    }

    // Only allow deletion of pending submissions
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending submissions' },
        { status: 400 },
      );
    }

    // Delete the uploaded file
    if (submission.fileUrl) {
      await deleteFile(submission.fileUrl);
    }

    await prisma.preliminarySubmission.delete({
      where: { id: submissionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete submission error:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 },
    );
  }
}
