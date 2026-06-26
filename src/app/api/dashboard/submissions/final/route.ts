/**
 * ============================================================================
 * FINAL SUBMISSION API
 * ============================================================================
 *
 * POST - Submit final pitch deck / presentation
 *   Accepts two modes:
 *   - JSON body with { storagePath, fileName, fileSize } → presigned URL flow
 *   - FormData with file field → legacy server-side upload
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateFileServer } from '@/lib/fileConfig';
import { getFileUrl, uploadFile } from '@/lib/fileUpload';
import { logSubmissionToSheets } from '@/lib/google-sheets';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit(req, RATE_LIMITS.API);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    const isJsonBody = contentType.includes('application/json');

    let registrationId: string;
    let competitionCode: string;
    let fileUrl: string;
    let fileName: string;
    let fileSize: number;
    let legacyFile: File | null = null;

    if (isJsonBody) {
      // ── Presigned URL flow ──
      const body = await req.json();
      registrationId = body.registrationId;
      competitionCode = body.competitionCode;
      fileName = body.fileName;
      fileSize = body.fileSize;

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

      fileUrl = await getFileUrl('final', body.storagePath);
    } else {
      // ── Legacy FormData flow ──
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
          { error: 'A file is required for final submission' },
          { status: 400 },
        );
      }

      const validation = validateFileServer(legacyFile, 'final');
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      fileName = legacyFile.name;
      fileSize = legacyFile.size;
      fileUrl = ''; // Set after upload
    }

    // Verify registration
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        competition: true,
        team: { include: { members: { orderBy: { orderIndex: 'asc' } } } },
      },
    });

    if (!registration || registration.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      );
    }

    if (registration.currentPhase !== 'final') {
      return NextResponse.json(
        { error: 'You are not in the final phase' },
        { status: 400 },
      );
    }

    if (!registration.isSemifinalQualified) {
      return NextResponse.json(
        { error: 'You must pass the semifinal phase first' },
        { status: 400 },
      );
    }

    if (
      registration.competition.finalDeadline &&
      new Date() > new Date(registration.competition.finalDeadline)
    ) {
      return NextResponse.json(
        { error: 'Final deadline has passed' },
        { status: 400 },
      );
    }

    if (
      registration.competition.finalStart &&
      new Date() < new Date(registration.competition.finalStart)
    ) {
      return NextResponse.json(
        { error: 'Final submission period has not started yet' },
        { status: 400 },
      );
    }

    const existing = await prisma.finalSubmission.findUnique({
      where: { registrationId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Final submission already exists' },
        { status: 409 },
      );
    }

    // Legacy flow: upload file now
    if (!isJsonBody && legacyFile) {
      const teamName = registration.team?.teamName || 'team';
      const prefix = `${competitionCode}-final-${teamName}`.replace(
        /[^a-zA-Z0-9-]/g,
        '_',
      );
      const uploaded = await uploadFile(legacyFile, 'final', prefix);
      fileUrl = uploaded.url;
    }

    // Create final submission
    const submission = await prisma.finalSubmission.create({
      data: {
        registrationId,
        pitchDeckUrl: fileUrl,
        fileName,
        fileSize,
      },
    });

    // Log to Google Sheets (non-blocking)
    try {
      await logSubmissionToSheets({
        teamName: registration.team?.teamName || 'N/A',
        leaderEmail: registration.user.email,
        competitionCode,
        submissionPhase: 'final',
        fileUrl,
        fileName,
        status: 'submitted',
        reviewNotes: 'Final submission received',
      });
    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets sync failed for final:', sheetsError);
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Final submission uploaded successfully',
    });
  } catch (error: any) {
    console.error('Final submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit final' },
      { status: 500 },
    );
  }
}
