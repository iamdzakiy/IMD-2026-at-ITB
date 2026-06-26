/**
 * ============================================================================
 * EMAIL BLAST — EVENT DETAILS UPDATE
 * ============================================================================
 *
 * Purpose: Send updated event details (confirmed venue + Zoom link) to users
 *          who registered for YIF x Grand Seminar BEFORE the update went live.
 *
 * Cutoff: 11:40 WIB on March 6, 2026 = 2026-03-06T04:40:00.000Z (UTC)
 *
 * Usage:
 *   Phase 1 (dry run / query only):
 *     npx tsx scripts/email-blast-event-update.ts
 *
 *   Phase 2 (actually send emails):
 *     npx tsx scripts/email-blast-event-update.ts --send
 *
 * ============================================================================
 */

import { prisma } from '../src/lib/db';
import { transporter } from '../src/lib/mailTransporter';
import { getBaseUrl } from '../src/lib/base-url';

// ── Constants ──────────────────────────────────────────────────────────────────

const EVENT_CODE = 'yif-x-grand-seminar';
const CUTOFF_UTC = new Date('2026-03-06T04:40:00.000Z'); // 11:40 WIB
const BASE_URL = getBaseUrl();
const FROM_EMAIL = process.env.SMTP_USER || 'imd 2026 at itb@IMD 2026 at ITB-itb.org';
const FROM_NAME = 'The IMD 2026 at ITB 3.0 - IMD 2026 at ITB';
const LOGO_URL = `${BASE_URL}/logo/logo-white.svg`;
const TICKET_URL = `${BASE_URL}/event/${EVENT_CODE}/register`;
const COMPETITIONS_URL = `${BASE_URL}/competitions`;

const SEND_MODE = process.argv.includes('--send');

// ── Email HTML Builder ─────────────────────────────────────────────────────────

function buildUpdateEmailHtml(name: string, eventName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Updated Event Details</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(180deg, #0B0102 0%, #190204 50%, #0B0102 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #1a0405;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      border: 2px solid rgba(255, 205, 141, 0.2);
    }
    .header {
      background: linear-gradient(135deg, #190204 0%, #2d0609 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .site-title {
      margin: 0;
      background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .subtitle {
      margin: 8px 0 0 0;
      color: #E8B4A8;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px 30px;
      background-color: #1a0405;
    }
    .update-badge {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 25px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
      border: 1px solid rgba(59, 130, 246, 0.4);
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    .title {
      margin: 0 0 20px 0;
      background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 28px;
      font-weight: bold;
    }
    .text {
      margin: 0 0 16px 0;
      color: #E8B4A8;
      font-size: 16px;
      line-height: 1.7;
    }
    .info-box {
      background: linear-gradient(135deg, rgba(139, 90, 58, 0.2) 0%, rgba(90, 56, 36, 0.2) 100%);
      border-left: 4px solid #8B5A3A;
      padding: 18px;
      margin: 30px 0;
      border-radius: 8px;
      border: 1px solid rgba(255, 205, 141, 0.2);
    }
    .info-text {
      margin: 0;
      color: #E8B4A8;
      font-size: 15px;
      line-height: 1.6;
    }
    .discount-box {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-left: 4px solid #22C55E;
      border-radius: 8px;
      padding: 18px;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #8B3A3A 0%, #5A2424 100%);
      color: #FFFFFF;
      text-decoration: none;
      padding: 18px 45px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 8px 25px rgba(139, 58, 58, 0.4);
      border: 1px solid rgba(255, 205, 141, 0.3);
      letter-spacing: 0.5px;
    }
    .button-secondary {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%);
      color: #FFFFFF;
      text-decoration: none;
      padding: 14px 35px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 15px;
      box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
      border: 1px solid rgba(59, 130, 246, 0.3);
      letter-spacing: 0.5px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .footer {
      background: linear-gradient(135deg, #0B0102 0%, #190204 100%);
      padding: 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 205, 141, 0.1);
    }
    .footer-text {
      margin: 0 0 8px 0;
      color: #9b7a6f;
      font-size: 13px;
    }
    .footer-copyright {
      margin: 8px 0 0 0;
      color: #6b5651;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="The IMD 2026 at ITB 3.0" width="180" style="display: block; margin: 0 auto 16px auto; max-width: 180px; height: auto;" />
      <h1 class="site-title">The IMD 2026 at ITB 3.0</h1>
      <p class="subtitle">IMD 2026 at ITB Student Branch</p>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <div class="update-badge">📢 EVENT DETAILS UPDATE</div>
      </div>

      <h2 class="title">Hi ${name},</h2>

      <p class="text">We have an important update regarding your registration for <strong style="color: #FFCD8D;">${eventName}</strong>.</p>

      <p class="text">The <strong style="color: #FFCD8D;">venue</strong> and <strong style="color: #FFCD8D;">Zoom link</strong> for the event have now been confirmed. Please find the updated details below:</p>

      <div class="info-box">
        <p class="info-text"><strong style="color: #FFCD8D;">Event:</strong> ${eventName}</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Status:</strong> Confirmed ✅</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Date:</strong> March 7, 2026</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Venue:</strong> Seminar Auditorium Lantai 8, Gedung PAU @ Institut Teknologi Bandung</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Open Gate:</strong> 12.00 WIB</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Zoom Link:</strong> <a href="https://ui-ac-id.zoom.us/j/98559432483?pwd=RFuTp23fwYtdbSPKFG2zva4CYpBi3q.1" style="color: #FFCD8D; text-decoration: underline;">Join via Zoom</a></p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Fee:</strong> FREE</p>
      </div>

      <p class="text">Your registration is still <strong style="color: #22C55E;">confirmed</strong> — no further action is needed. You can also download your event ticket from the link below.</p>

      <div class="button-container">
        <a href="${TICKET_URL}" class="button">
          🎟️ View & Download Ticket
        </a>
      </div>

      <div class="discount-box">
        <p style="margin: 0 0 8px 0; color: #22C55E; font-size: 18px; font-weight: bold;">🎉 Exclusive Discount for Attendees!</p>
        <p style="margin: 0; color: #E8B4A8; font-size: 15px; line-height: 1.6;">As a registered attendee, you're eligible for exclusive pricing when you register for any of our competitions. You'll automatically get the early registration price, no matter the current phase!</p>
      </div>

      <div class="button-container">
        <a href="${COMPETITIONS_URL}" class="button-secondary">
          Browse Competitions
        </a>
      </div>
    </div>

    <div class="footer">
      <p class="footer-text">
        Need help? Contact us at
        <a href="mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org" style="color: #FFCD8D; text-decoration: none;">
          imd 2026 at itb@IMD 2026 at ITB-itb.org
        </a>
      </p>
      <p class="footer-copyright">
        © 2026 The IMD 2026 at ITB - IMD 2026 at ITB Student Branch. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  📢 EMAIL BLAST — Event Details Update');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Event:   ${EVENT_CODE}`);
  console.log(`  Cutoff:  ${CUTOFF_UTC.toISOString()} (11:40 WIB)`);
  console.log(
    `  Mode:    ${SEND_MODE ? '🚀 SEND MODE' : '🔍 DRY RUN (query only)'}`,
  );
  console.log('═══════════════════════════════════════════════════════════\n');

  // ── Step 1: Query affected users ─────────────────────────────────────────

  console.log('📋 Step 1: Querying affected users...\n');

  const affectedUsers = await prisma.eventRegistration.findMany({
    where: {
      eventCode: EVENT_CODE,
      createdAt: { lt: CUTOFF_UTC },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      institution: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (affectedUsers.length === 0) {
    console.log('✅ No affected users found. Nothing to send.\n');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${affectedUsers.length} affected user(s):\n`);
  console.log(
    '┌────┬────────────────────────────────┬──────────────────────────────────┬──────────────────────────┐',
  );
  console.log(
    '│ #  │ Name                           │ Email                            │ Registered At (WIB)      │',
  );
  console.log(
    '├────┼────────────────────────────────┼──────────────────────────────────┼──────────────────────────┤',
  );

  affectedUsers.forEach((user, i) => {
    const wibTime = new Date(user.createdAt.getTime() + 7 * 60 * 60 * 1000);
    const timeStr =
      wibTime.toISOString().replace('T', ' ').slice(0, 19) + ' WIB';
    const num = String(i + 1).padStart(2);
    const name = user.fullName.padEnd(30).slice(0, 30);
    const email = user.email.padEnd(32).slice(0, 32);
    console.log(`│ ${num} │ ${name} │ ${email} │ ${timeStr} │`);
  });

  console.log(
    '└────┴────────────────────────────────┴──────────────────────────────────┴──────────────────────────┘\n',
  );

  // Also query users who registered AFTER the cutoff (for verification / exclusion check)
  const afterCutoffCount = await prisma.eventRegistration.count({
    where: {
      eventCode: EVENT_CODE,
      createdAt: { gte: CUTOFF_UTC },
    },
  });

  console.log(
    `ℹ️  Users registered AFTER cutoff (will NOT receive blast): ${afterCutoffCount}\n`,
  );

  // ── Step 2: Send emails (only in --send mode) ────────────────────────────

  if (!SEND_MODE) {
    console.log('─────────────────────────────────────────────────────────');
    console.log('  🔍 DRY RUN complete. No emails were sent.');
    console.log('  To send emails, run:');
    console.log('    npx tsx scripts/email-blast-event-update.ts --send');
    console.log('─────────────────────────────────────────────────────────\n');
    await prisma.$disconnect();
    return;
  }

  console.log('🚀 Step 2: Sending emails...\n');

  const EVENT_NAME = 'YIF x Grand Seminar: The IMD 2026 at ITB 3.0';
  const results: {
    email: string;
    name: string;
    success: boolean;
    error?: string;
  }[] = [];
  let sent = 0;
  let failed = 0;

  for (const user of affectedUsers) {
    const { email, fullName } = user;

    try {
      const html = buildUpdateEmailHtml(fullName, EVENT_NAME);

      await transporter.sendMail({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: '📢 Updated Event Details — YIF x Grand Seminar',
        html,
      });

      sent++;
      results.push({ email, name: fullName, success: true });
      console.log(
        `  ✅ [${sent + failed}/${affectedUsers.length}] Sent to ${email}`,
      );
    } catch (err) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ email, name: fullName, success: false, error: errorMsg });
      console.log(
        `  ❌ [${sent + failed}/${affectedUsers.length}] FAILED: ${email} — ${errorMsg}`,
      );
    }

    // Small delay between sends to avoid rate limiting
    if (sent + failed < affectedUsers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // ── Step 3: Post-send audit ──────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  📊 POST-SEND AUDIT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total identified:   ${affectedUsers.length}`);
  console.log(`  Successfully sent:  ${sent}`);
  console.log(`  Failed:             ${failed}`);
  console.log(`  Excluded (after):   ${afterCutoffCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('⚠️  Failed deliveries:\n');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  ❌ ${r.name} <${r.email}>`);
        console.log(`     Error: ${r.error}\n`);
      });
  }

  if (failed === 0) {
    console.log('✅ All emails sent successfully!\n');
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
