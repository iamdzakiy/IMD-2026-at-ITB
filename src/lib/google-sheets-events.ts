import { logger } from './logger';
/**
 * ============================================================================
 * GOOGLE SHEETS - EVENT REGISTRATION SYNC
 * ============================================================================
 *
 * Separate Google Sheets integration for Event registrations.
 * Uses a dedicated sheet (GOOGLE_SHEET_ID_EVENTS env var).
 *
 * Setup:
 * 1. Create a new Google Sheet for event registrations
 * 2. Share it with the service account email
 * 3. Add GOOGLE_SHEET_ID_EVENTS to .env
 * ============================================================================
 */

import { google } from 'googleapis';

const getGoogleSheetsClient = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

/**
 * Append event registration data to Google Sheets
 * Non-blocking — registration succeeds even if this fails
 */
export async function appendEventToGoogleSheets(data: {
  registrationId: string;
  eventCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  amount: number;
  paymentMethod: string;
  verificationStatus: string;
}) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_EVENTS;

    if (!sheetId) {
      logger.warn('⚠️ GOOGLE_SHEET_ID_EVENTS not configured, skipping sync');
      return { success: false, error: 'Sheet ID not configured' };
    }

    const sheets = getGoogleSheetsClient();

    const rowData = [
      [
        data.registrationId,
        data.eventCode,
        data.fullName,
        data.email,
        data.phoneNumber,
        data.institution,
        data.amount.toString(),
        data.paymentMethod,
        data.verificationStatus,
        new Date().toISOString(),
        'website',
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      requestBody: {
        values: rowData,
      },
    });

    logger.info(
      `✅ Event registration synced to Google Sheets: ${data.fullName}`,
    );
    return { success: true };
  } catch (error) {
    logger.error(
      '❌ Failed to sync event registration to Google Sheets:',
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
