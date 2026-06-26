/**
 * ============================================================================
 * EMAIL SERVICE - COMPETITION REGISTRATION
 * ============================================================================
 *
 * Purpose: Send emails for registration flow
 * - Account activation
 * - Password reset
 * - Registration confirmation
 * - Status updates
 * ============================================================================
 */

import { getBaseUrl } from './base-url';
import { transporter } from './mailTransporter';

const BASE_URL = getBaseUrl();
const FROM_EMAIL =
  process.env.SMTP_USER || 'imd 2026 at itb@IMD 2026 at ITB-itb.org';
const FROM_NAME = 'The IMD 2026 at ITB 3.0 - IMD 2026 at ITB';
const LOGO_URL = `${BASE_URL}/logo/logo-white.svg`;

/**
 * Send account activation email
 */
export async function sendActivationEmail(
  to: string,
  name: string,
  token: string,
) {
  const activationUrl = `${BASE_URL}/activate?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your Account</title>
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
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .info-box {
      background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%);
      border-left: 4px solid #8B3A3A;
      padding: 18px;
      margin: 30px 0;
      border-radius: 8px;
      border: 1px solid rgba(139, 58, 58, 0.3);
    }
    .info-text {
      margin: 0;
      color: #FFCD8D;
      font-size: 14px;
      line-height: 1.6;
    }
    .link {
      color: #FFCD8D;
      text-decoration: none;
      word-break: break-all;
      font-size: 13px;
    }
    .link-box {
      margin: 8px 0 0 0;
      padding: 12px;
      background: rgba(255, 205, 141, 0.05);
      border-radius: 6px;
      border: 1px solid rgba(255, 205, 141, 0.1);
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
    .steps {
      margin-top: 30px;
      padding-left: 20px;
      color: #E8B4A8;
    }
    .steps li {
      margin-bottom: 8px;
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
      <h2 class="title">Welcome, ${name}!</h2>
      
      <p class="text">Thank you for registering for <strong style="color: #FFCD8D;">The IMD 2026 at ITB 3.0</strong>! We're excited to have you join our competition.</p>
      
      <p class="text">To complete your registration and activate your account, please verify your email address by clicking the button below:</p>

      <div class="button-container">
        <a href="${activationUrl}" class="button">
          Activate My Account
        </a>
      </div>

      <div class="info-box">
        <p class="info-text">
          <strong>Important:</strong> This activation link will expire in <strong>24 hours</strong>.
        </p>
      </div>

      <p class="text" style="margin-top: 20px; color: #9b7a6f; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <div class="link-box">
        <a href="${activationUrl}" class="link">${activationUrl}</a>
      </div>

      <div style="margin-top: 30px;">
        <p class="text"><strong style="color: #FFCD8D;">What's next?</strong></p>
        <ol class="steps">
          <li>Activate your account using the link above</li>
          <li>Wait for admin to verify your team registration</li>
          <li>Get ready for the competition! </li>
        </ol>
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: '✅ Activate Your IMD 2026 at ITB Account - Action Required',
      html,
    });

    console.log(`✅ Activation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send activation email:', error);
    throw error;
  }
}

/**
 * Send registration confirmation email (after admin approval)
 */
export async function sendRegistrationApprovedEmail(
  to: string,
  name: string,
  teamName: string,
  competitionName: string,
) {
  const dashboardUrl = `${BASE_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Approved</title>
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
    .success-badge {
      background: linear-gradient(135deg, #8B5A3A 0%, #5A3824 100%);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 25px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 205, 141, 0.3);
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
    .button-container {
      text-align: center;
      margin: 35px 0;
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
    .steps {
      margin-top: 20px;
      padding-left: 20px;
      color: #E8B4A8;
    }
    .steps li {
      margin-bottom: 8px;
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
        <div class="success-badge">REGISTRATION APPROVED</div>
      </div>

      <h2 class="title">Congratulations, ${name}!</h2>
      
      <p class="text">Great news! Your team registration has been <strong style="color: #FFCD8D;">approved</strong> by our admin team.</p>
      
      <div class="info-box">
        <p class="info-text" style="margin: 0;"><strong style="color: #FFCD8D;">Team:</strong> ${teamName}</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Competition:</strong> ${competitionName}</p>
      </div>

      <p class="text"><strong style="color: #FFCD8D;">Next Steps:</strong></p>
      <ol class="steps">
        <li>Visit your dashboard to see the updated status</li>
        <li>Submit your preliminary work (abstract/proposal)</li>
        <li>Wait for preliminary evaluation</li>
      </ol>

      <div class="info-box">
        <p class="info-text">
          <strong style="color: #FFCD8D;">Important:</strong> Your profile has been updated. Refresh the page if you don't see the changes immediately.
        </p>
      </div>

      <div class="button-container">
        <a href="${dashboardUrl}" class="button">
          Go to Dashboard
        </a>
      </div>

      <!-- WhatsApp Community -->
      <div style="margin-top: 30px; background: linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.05) 100%); border: 1px solid rgba(37, 211, 102, 0.3); border-left: 4px solid #25D366; border-radius: 8px; padding: 18px;">
        <p style="margin: 0 0 12px 0; color: #E8B4A8; font-size: 15px; line-height: 1.6;">
          Join our <strong style="color: #25D366;">WhatsApp community</strong> to stay updated and connect with other participants!
        </p>
        <div style="text-align: center;">
          <a href="https://chat.whatsapp.com/F1cMqNILYo54if7rVpUOS8" style="display: inline-block; background: #25D366; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px; letter-spacing: 0.3px;" target="_blank">
            💬 Join WhatsApp Community
          </a>
        </div>
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: '🎉 Your Registration Has Been Approved!',
      html,
    });

    console.log(`✅ Approval email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
    throw error;
  }
}

/**
 * Send registration rejection email
 */
export async function sendRegistrationRejectedEmail(
  to: string,
  name: string,
  teamName: string,
  reason?: string,
) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Update</title>
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
    .title {
      margin: 0 0 20px 0;
      background: linear-gradient(90deg, #FFCD8D 0%, #FFFFFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 24px;
      font-weight: bold;
    }
    .text {
      margin: 0 0 16px 0;
      color: #E8B4A8;
      font-size: 16px;
      line-height: 1.7;
    }
    .reason-box {
      background: linear-gradient(135deg, rgba(139, 58, 58, 0.3) 0%, rgba(90, 36, 36, 0.3) 100%);
      border-left: 4px solid #8B3A3A;
      padding: 18px;
      margin: 30px 0;
      border-radius: 8px;
      border: 1px solid rgba(139, 58, 58, 0.4);
    }
    .reason-text {
      margin: 0;
      color: #FFCD8D;
      font-size: 14px;
      line-height: 1.6;
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
      <h2 class="title">Registration Update for ${teamName}</h2>

      <p class="text">Dear ${name},</p>
      
      <p class="text">Thank you for your interest in participating in The IMD 2026 at ITB 3.0. Unfortunately, we regret to inform you that your team registration could not be approved at this time.</p>

      ${
        reason
          ? `
      <div class="reason-box">
        <p class="reason-text" style="margin: 0;"><strong>Reason:</strong></p>
        <p class="reason-text" style="margin: 8px 0 0 0;">${reason}</p>
      </div>
      `
          : ''
      }

      <p class="text">If you believe this is a mistake or have questions, please don't hesitate to contact us.</p>
    </div>

    <div class="footer">
      <p class="footer-text">
        Contact us at 
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Registration Update - The IMD 2026 at ITB 3.0',
      html,
    });

    console.log(`✅ Rejection email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .warning-box {
      background: linear-gradient(135deg, rgba(139, 58, 58, 0.2) 0%, rgba(90, 36, 36, 0.2) 100%);
      border-left: 4px solid #8B3A3A;
      padding: 18px;
      margin: 30px 0;
      border-radius: 8px;
      border: 1px solid rgba(139, 58, 58, 0.3);
    }
    .warning-text {
      margin: 0;
      color: #FFCD8D;
      font-size: 14px;
      line-height: 1.6;
    }
    .link {
      color: #FFCD8D;
      text-decoration: none;
      word-break: break-all;
      font-size: 13px;
    }
    .link-box {
      margin: 8px 0 0 0;
      padding: 12px;
      background: rgba(255, 205, 141, 0.05);
      border-radius: 6px;
      border: 1px solid rgba(255, 205, 141, 0.1);
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
      <h2 class="title">Reset Your Password</h2>
      
      <p class="text">Hi ${name},</p>
      
      <p class="text">We received a request to reset your password for your IMD 2026 at ITB account. Click the button below to create a new password:</p>

      <div class="button-container">
        <a href="${resetUrl}" class="button">
          Reset Password
        </a>
      </div>

      <div class="warning-box">
        <p class="warning-text">
          <strong>Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
        </p>
      </div>

      <p class="text" style="color: #9b7a6f; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <div class="link-box">
        <a href="${resetUrl}" class="link">${resetUrl}</a>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: rgba(139, 58, 58, 0.15); border-radius: 8px; border: 1px solid rgba(139, 58, 58, 0.2);">
        <p class="text" style="margin: 0; font-size: 14px; color: #E8B4A8;">
          <strong style="color: #FFCD8D;">Didn't request this?</strong><br>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: '🔒 Reset Your Password - The IMD 2026 at ITB 3.0',
      html,
    });

    console.log(`✅ Password reset email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send event registration approval email with event details
 */
export async function sendEventApprovalEmail(
  to: string,
  name: string,
  eventName: string,
  discountLabel: string,
  discountDescription: string,
) {
  const competitionsUrl = `${BASE_URL}/competitions`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Approved</title>
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
    .success-badge {
      background: linear-gradient(135deg, #8B5A3A 0%, #5A3824 100%);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 25px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 205, 141, 0.3);
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
    .button-container {
      text-align: center;
      margin: 35px 0;
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
        <div class="success-badge">EVENT REGISTRATION APPROVED</div>
      </div>

      <h2 class="title">Welcome, ${name}!</h2>

      <p class="text">Your registration for <strong style="color: #FFCD8D;">${eventName}</strong> has been <strong style="color: #FFCD8D;">approved</strong>.</p>

      <div class="info-box">
        <p class="info-text"><strong style="color: #FFCD8D;">Event:</strong> ${eventName}</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Status:</strong> Approved ✅</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Date:</strong> March 7, 2026</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Venue:</strong> Seminar Auditorium Lantai 8, Gedung PAU @ Institut Teknologi Bandung</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Open Gate:</strong> 12.00 WIB</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Zoom Link:</strong> <a href="https://ui-ac-id.zoom.us/j/98559432483?pwd=RFuTp23fwYtdbSPKFG2zva4CYpBi3q.1" style="color: #FFCD8D; text-decoration: underline;">Join via Zoom</a></p>
      </div>

      <div class="discount-box">
        <p style="margin: 0 0 8px 0; color: #22C55E; font-size: 18px; font-weight: bold;">🎉 ${discountLabel}</p>
        <p style="margin: 0; color: #E8B4A8; font-size: 15px; line-height: 1.6;">${discountDescription}</p>
        <p style="margin: 8px 0 0 0; color: #E8B4A8; font-size: 14px;">Register for a competition now and you'll automatically get the early registration price, no matter the current phase!</p>
      </div>

      <div class="button-container">
        <a href="${competitionsUrl}" class="button">
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: '🎉 Your Event Registration Has Been Approved!',
      html,
    });

    console.log(`✅ Event approval email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send event approval email:', error);
    throw error;
  }
}

/**
 * Send event registration confirmation email (instant — no approval needed)
 * Used for the free registration flow where users are immediately confirmed.
 */
export async function sendEventRegistrationConfirmationEmail(
  to: string,
  name: string,
  eventName: string,
) {
  const competitionsUrl = `${BASE_URL}/competitions`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmed</title>
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
    .confirmed-badge {
      background: linear-gradient(135deg, #166534 0%, #14532d 100%);
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 25px;
      display: inline-block;
      font-weight: bold;
      margin-bottom: 20px;
      border: 1px solid rgba(34, 197, 94, 0.4);
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
        <div class="confirmed-badge">✅ REGISTRATION CONFIRMED</div>
      </div>

      <h2 class="title">Welcome, ${name}!</h2>

      <p class="text">You're all set! Your registration for <strong style="color: #FFCD8D;">${eventName}</strong> has been <strong style="color: #22C55E;">confirmed</strong>.</p>

      <p class="text">No further action is needed — just mark the date and we'll see you there!</p>

      <div class="info-box">
        <p class="info-text"><strong style="color: #FFCD8D;">Event:</strong> ${eventName}</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Status:</strong> Confirmed ✅</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Date:</strong> March 7, 2026</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Venue:</strong> Seminar Auditorium Lantai 8, Gedung PAU @ Institut Teknologi Bandung</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Open Gate:</strong> 12.00 WIB</p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Zoom Link:</strong> <a href="https://ui-ac-id.zoom.us/j/98559432483?pwd=RFuTp23fwYtdbSPKFG2zva4CYpBi3q.1" style="color: #FFCD8D; text-decoration: underline;">Join via Zoom</a></p>
        <p class="info-text" style="margin: 8px 0 0 0;"><strong style="color: #FFCD8D;">Fee:</strong> FREE</p>
      </div>

      <div class="discount-box">
        <p style="margin: 0 0 8px 0; color: #22C55E; font-size: 18px; font-weight: bold;">🎉 Exclusive Discount for Attendees!</p>
        <p style="margin: 0; color: #E8B4A8; font-size: 15px; line-height: 1.6;">As a registered attendee, you're eligible for exclusive pricing when you register for any of our competitions. You'll automatically get the early registration price, no matter the current phase!</p>
      </div>

      <div class="button-container">
        <a href="${competitionsUrl}" class="button">
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

  try {
    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: '✅ Your Event Registration is Confirmed!',
      html,
    });

    console.log(`✅ Event registration confirmation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(
      '❌ Failed to send event registration confirmation email:',
      error,
    );
    throw error;
  }
}
