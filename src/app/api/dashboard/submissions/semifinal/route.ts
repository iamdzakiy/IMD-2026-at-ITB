/**
 * ============================================================================
 * SEMIFINAL SUBMISSION API
 * ============================================================================
 *
 * POST - Submit semifinal materials (competition-specific fields)
 *   Accepts two modes:
 *   - JSON body with storagePaths → presigned URL flow (recommended)
 *   - FormData with files → legacy server-side upload
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
    const submissionData: any = {};

    // Store FormData fields for legacy flow (must read body only once)
    let legacyFormData: FormData | null = null;

    if (isJsonBody) {
      // ── Presigned URL flow ──
      const body = await req.json();
      registrationId = body.registrationId;
      competitionCode = body.competitionCode;

      if (!registrationId) {
        return NextResponse.json(
          { error: 'Registration ID is required' },
          { status: 400 },
        );
      }

      submissionData.registrationId = registrationId;
      submissionData.competitionType = competitionCode as 'PTC' | 'TPC' | 'BCC';

      // Resolve file URLs from storage paths
      if (body.files) {
        for (const [key, storagePath] of Object.entries(body.files)) {
          if (storagePath && typeof storagePath === 'string') {
            submissionData[key] = await getFileUrl('semifinal', storagePath);
          }
        }
      }
      // URL fields (e.g., prototypeVideoUrl) are passed directly
      if (body.urls) {
        for (const [key, url] of Object.entries(body.urls)) {
          if (url && typeof url === 'string') {
            submissionData[key] = url;
          }
        }
      }
    } else {
      // ── Legacy FormData flow ──
      legacyFormData = await req.formData();
      registrationId = legacyFormData.get('registrationId') as string;
      competitionCode = legacyFormData.get('competitionCode') as string;

      if (!registrationId) {
        return NextResponse.json(
          { error: 'Registration ID is required' },
          { status: 400 },
        );
      }

      submissionData.registrationId = registrationId;
      submissionData.competitionType = competitionCode as 'PTC' | 'TPC' | 'BCC';
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

    if (registration.currentPhase !== 'semifinal') {
      return NextResponse.json(
        { error: 'You are not in the semifinal phase' },
        { status: 400 },
      );
    }

    if (!registration.isPreliminaryQualified) {
      return NextResponse.json(
        { error: 'You must pass the preliminary phase first' },
        { status: 400 },
      );
    }

    if (new Date() > new Date(registration.competition.semifinalDeadline)) {
      return NextResponse.json(
        { error: 'Semifinal deadline has passed' },
        { status: 400 },
      );
    }

    if (new Date() < new Date(registration.competition.semifinalStart)) {
      return NextResponse.json(
        { error: 'Semifinal submission period has not started yet' },
        { status: 400 },
      );
    }

    const existing = await prisma.semifinalSubmission.findUnique({
      where: { registrationId },
    });
    if (existing && existing.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Semifinal submission already exists' },
        { status: 409 },
      );
    }
    // Allow resubmission if previous was rejected — delete old record first
    if (existing?.status === 'rejected') {
      await prisma.semifinalSubmission.delete({ where: { registrationId } });
    }

    // Legacy flow: handle file uploads from FormData
    if (!isJsonBody && legacyFormData) {
      const teamName = registration.team?.teamName || 'team';
      const prefix = `${competitionCode}-semifinal-${teamName}`.replace(
        /[^a-zA-Z0-9-]/g,
        '_',
      );

      if (competitionCode === 'PTC') {
        const proposalFile = legacyFormData.get('proposalUrl') as File | null;
        const prototypeVideoUrl = legacyFormData.get('prototypeVideoUrl') as
          | string
          | null;

        if (proposalFile instanceof File) {
          const validation = validateFileServer(proposalFile, 'semifinal');
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 },
            );
          }
          const uploaded = await uploadFile(
            proposalFile,
            'semifinal',
            `${prefix}-proposal`,
          );
          submissionData.proposalUrl = uploaded.url;
        }
        if (prototypeVideoUrl) {
          submissionData.prototypeVideoUrl = prototypeVideoUrl;
        }
      } else if (competitionCode === 'TPC') {
        const paperFile = legacyFormData.get('paperUrl') as File | null;
        const presentationFile = legacyFormData.get(
          'presentationUrl', // Poster Campaign (stored as presentationUrl in DB)
        ) as File | null;

        if (paperFile instanceof File) {
          const validation = validateFileServer(paperFile, 'semifinal');
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 },
            );
          }
          const uploaded = await uploadFile(
            paperFile,
            'semifinal',
            `${prefix}-paper`,
          );
          submissionData.paperUrl = uploaded.url;
        }
        if (presentationFile instanceof File) {
          const validation = validateFileServer(presentationFile, 'semifinal');
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 },
            );
          }
          const uploaded = await uploadFile(
            presentationFile,
            'semifinal',
            `${prefix}-presentation`,
          );
          submissionData.presentationUrl = uploaded.url;
        }
      } else if (competitionCode === 'BCC') {
        const businessPlanFile = legacyFormData.get(
          'businessPlanUrl',
        ) as File | null;
        const pitchDeckFile = legacyFormData.get('pitchDeckUrl') as File | null;

        if (businessPlanFile instanceof File) {
          const validation = validateFileServer(businessPlanFile, 'semifinal');
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 },
            );
          }
          const uploaded = await uploadFile(
            businessPlanFile,
            'semifinal',
            `${prefix}-businessplan`,
          );
          submissionData.businessPlanUrl = uploaded.url;
        }
        if (pitchDeckFile instanceof File) {
          const validation = validateFileServer(pitchDeckFile, 'semifinal');
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error },
              { status: 400 },
            );
          }
          const uploaded = await uploadFile(
            pitchDeckFile,
            'semifinal',
            `${prefix}-pitchdeck`,
          );
          submissionData.pitchDeckUrl = uploaded.url;
        }
      }
    }

    // Create semifinal submission
    const submission = await prisma.semifinalSubmission.create({
      data: submissionData,
    });

    // Log to Google Sheets (non-blocking)
    try {
      const fileUrls = [
        submissionData.proposalUrl,
        submissionData.prototypeVideoUrl,
        submissionData.paperUrl,
        submissionData.presentationUrl,
        submissionData.businessPlanUrl,
        submissionData.pitchDeckUrl,
      ]
        .filter(Boolean)
        .join(', ');

      await logSubmissionToSheets({
        teamName: registration.team?.teamName || 'N/A',
        leaderEmail: registration.user.email,
        competitionCode,
        submissionPhase: 'semifinal',
        fileUrl: fileUrls || undefined,
        status: 'submitted',
        reviewNotes: `Semifinal submission received (${competitionCode})`,
      });
    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets sync failed for semifinal:', sheetsError);
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Semifinal submission uploaded successfully',
    });
  } catch (error: any) {
    console.error('Semifinal submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit semifinal' },
      { status: 500 },
    );
  }
}
