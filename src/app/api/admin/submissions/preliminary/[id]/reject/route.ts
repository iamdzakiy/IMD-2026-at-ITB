import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getBaseUrl } from '@/lib/base-url';
import { prisma } from '@/lib/db';
import { logSubmissionToSheets } from '@/lib/google-sheets';

/** Escape HTML to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
import { sendMail } from '@/lib/mailTransporter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (!['super_admin', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { adminId, feedback } = await req.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required for rejection' },
        { status: 400 },
      );
    }

    const { id: submissionId } = await params;

    // Get submission with related data
    const submission = await prisma.preliminarySubmission.findUnique({
      where: { id: submissionId },
      include: {
        registration: {
          include: {
            team: {
              include: {
                members: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
            competition: true,
            user: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission already reviewed' },
        { status: 400 },
      );
    }

    // Update submission status
    await prisma.preliminarySubmission.update({
      where: { id: submissionId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewNotes: feedback.trim(),
      },
    });

    // Send rejection email to team leader
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #0B0102 0%, #190204 50%, #0B0102 100%); min-height: 100vh; }
            .container { max-width: 600px; margin: 40px auto; background-color: #1a0405; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(255, 205, 141, 0.2); }
            .header { background: linear-gradient(135deg, #190204 0%, #2d0609 100%); padding: 40px 30px; text-align: center; }
            .site-title { margin: 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; }
            .subtitle { margin: 8px 0 0 0; color: #E8B4A8; font-size: 14px; font-weight: 500; }
            .content { padding: 40px 30px; background-color: #1a0405; }
            .title { margin: 0 0 20px 0; background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: bold; }
            .text { margin: 0 0 16px 0; color: #E8B4A8; font-size: 16px; line-height: 1.7; }
            .status-badge { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 10px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; border: 1px solid rgba(239, 68, 68, 0.3); margin: 20px 0; }
            .info-box { background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%); border-left: 4px solid #8B3A3A; padding: 18px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(139, 58, 58, 0.3); }
            .info-text { margin: 4px 0; color: #FFCD8D; font-size: 14px; line-height: 1.6; }
            .feedback-box { background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 12px; margin: 24px 0; }
            .feedback-title { margin: 0 0 10px 0; color: #ef4444; font-size: 16px; font-weight: bold; }
            .feedback-text { margin: 0; color: #E8B4A8; font-size: 15px; line-height: 1.7; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #8B3A3A 0%, #5A2424 100%); color: #FFFFFF; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(139, 58, 58, 0.4); border: 1px solid rgba(255, 205, 141, 0.3); }
            .steps { margin-top: 20px; padding-left: 20px; color: #E8B4A8; }
            .steps li { margin-bottom: 8px; }
            .warning-box { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); }
            .warning-text { margin: 0; color: #f59e0b; font-size: 14px; line-height: 1.6; }
            .footer { background: linear-gradient(135deg, #0B0102 0%, #190204 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 205, 141, 0.1); }
            .footer-text { margin: 0 0 8px 0; color: #9b7a6f; font-size: 13px; }
            .footer-copyright { margin: 8px 0 0 0; color: #6b5651; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="site-title">The IMD 2026 at ITB 3.0</h1>
              <p class="subtitle">IMD 2026 at ITB Student Branch</p>
            </div>
            <div class="content">
              <h2 class="title">\u{1F4CB} Submission Review</h2>
              <p class="text">Dear <strong style="color: #FFCD8D;">${submission.registration.team?.members?.[0]?.fullName || submission.registration.user.name}</strong>,</p>
              <p class="text">Thank you for submitting your preliminary proposal for <strong style="color: #FFCD8D;">${submission.registration.competition.name}</strong>.</p>
              <div style="text-align: center;"><span class="status-badge">\u274c NEEDS REVISION</span></div>
              <div class="info-box">
                <p class="info-text"><strong>Team:</strong> ${submission.registration.team?.teamName || 'N/A'}</p>
                <p class="info-text"><strong>Competition:</strong> ${submission.registration.competition.name}</p>
                <p class="info-text"><strong>Submission:</strong> ${submission.fileName}</p>
                <p class="info-text"><strong>Reviewed:</strong> ${new Date().toLocaleString('id-ID')}</p>
              </div>
              <div class="feedback-box">
                <p class="feedback-title">\u{1F4DD} Reviewer Feedback:</p>
                <p class="feedback-text">${escapeHtml(feedback.trim())}</p>
              </div>
              <p class="text"><strong style="color: #FFCD8D;">What You Can Do:</strong></p>
              <ol class="steps"><li>Review the feedback carefully</li><li>Revise your submission</li><li>Delete current submission and upload a new one</li><li>Contact us for questions</li></ol>
              <div class="warning-box"><p class="warning-text"><strong>\u26a0\ufe0f Important:</strong> You can resubmit after making revisions. Please address all feedback points.</p></div>
              <div class="button-container"><a href="${getBaseUrl()}/dashboard" class="button">Go to Dashboard</a></div>
              <p class="text" style="margin-top: 24px;">Don't be discouraged! Many successful teams revise their submissions.</p>
            </div>
            <div class="footer">
              <p class="footer-text">Need help? Contact us at <a href="mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org" style="color: #FFCD8D; text-decoration: none;">imd 2026 at itb@IMD 2026 at ITB-itb.org</a></p>
              <p class="footer-copyright">\u00a9 2026 The IMD 2026 at ITB - IMD 2026 at ITB Student Branch. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendMail({
      to: submission.registration.user.email,
      subject: `📋 Preliminary Submission Requires Revision - ${submission.registration.competition.name}`,
      html: emailHtml,
    });

    // Log to Google Sheets
    await logSubmissionToSheets({
      teamName: submission.registration.team?.teamName || 'N/A',
      leaderEmail: submission.registration.user.email,
      competitionCode: submission.registration.competition.code,
      submissionPhase: 'preliminary',
      fileUrl: submission.fileUrl,
      fileName: submission.fileName,
      status: 'rejected',
      reviewedBy: session.admin.username,
      reviewNotes: feedback.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Submission rejected and email sent',
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
