import { logger } from './logger';
/**
 * ============================================================================
 * GOOGLE SHEETS API INTEGRATION
 * ============================================================================
 */

module.exports = nextConfig;
import { logger } from './logger';
/**
 * ============================================================================
 * GOOGLE SHEETS API INTEGRATION
 * ============================================================================
 *
 * Purpose: Sync registration data to Google Sheets for backup/redundancy
 *
 * Features:
 * - Real-time append to competition sheets
 * - Service Account authentication
 * - Error handling with logging
 * - Support for PTC, TPC, BCC competitions
 *
 * Setup Required:
 * 1. Create Google Service Account
 * 2. Enable Google Sheets API
 * 3. Share target sheets with service account email
 * 4. Add credentials to .env
 * ============================================================================
 */ import { google } from 'googleapis';

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  // Parse the private key (handle newlines properly)
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

// Get Sheet ID based on competition code
const getSheetIdByCompetition = (competitionCode: string): string | null => {
  const sheetIds = {
    PTC: process.env.GOOGLE_SHEET_ID_PTC,
    TPC: process.env.GOOGLE_SHEET_ID_TPC,
    BCC: process.env.GOOGLE_SHEET_ID_BCC,
  };

  return sheetIds[competitionCode as keyof typeof sheetIds] || null;
};

/**
 * Append registration data to Google Sheets
 * Non-blocking - registration succeeds even if this fails
 */
export async function appendToGoogleSheets(data: {
  registrationId: string;
  userId: string;
  competitionCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderInstitution: string;
  proofOfRegistrationLink: string;
  members: Array<{
    fullName: string;
    email: string;
    phoneNumber: string;
    institution?: string;
  }>;
  verificationStatus: string;
  currentPhase: string;
}) {
  try {
    const sheetId = getSheetIdByCompetition(data.competitionCode);

    if (!sheetId) {
      throw new Error(
        `Sheet ID not found for competition: ${data.competitionCode}`,
      );
    }

    const sheets = getGoogleSheetsClient();

    // Format members (max 4 members excluding leader)
    const memberColumns = Array(4)
      .fill('')
      .map((_, i) => {
        const member = data.members[i];
        return member
          ? `${member.fullName} | ${member.email} | ${member.phoneNumber} | ${member.institution || 'N/A'}`
          : '';
      });

    // Prepare row data matching the sheet structure (18 columns)
    const rowData = [
      [
        data.registrationId,
        data.teamName,
        data.leaderName,
        data.leaderEmail,
        data.leaderPhone,
        data.leaderInstitution,
        data.proofOfRegistrationLink,
        (data.members.length + 1).toString(), // Total members including leader
        data.competitionCode,
        ...memberColumns, // 4 member columns
        data.verificationStatus,
        'unpaid', // Default payment status
        data.currentPhase,
        new Date().toISOString(),
        'website', // Source
      ],
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:R', // 18 columns total
      valueInputOption: 'RAW',
      requestBody: {
        values: rowData,
      },
    });

    logger.info(
      `✅ Successfully synced ${data.competitionCode} registration to Google Sheets`,
    );
    return { success: true };
  } catch (error) {
    logger.error('❌ Failed to sync to Google Sheets:', error as any);
    // Don't throw - let registration succeed even if sheets sync fails
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read registrations from Google Sheets (for import/sync)
 */
export async function readFromGoogleSheets(competitionCode: string) {
  try {
    const sheetId = getSheetIdByCompetition(competitionCode);

    if (!sheetId) {
      throw new Error(`No sheet ID configured for ${competitionCode}`);
    }

    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:Z', // Skip header row
    });

    const rows = response.data.values || [];

    logger.info(
      `📊 Read ${rows.length} entries from ${competitionCode} Google Sheet`,
    );

    return rows;
  } catch (error) {
    logger.error('❌ Failed to read from Google Sheets:', error as any);
    throw error;
  }
}

/**
 * Batch append multiple registrations (for background sync)
 */
export async function batchAppendToGoogleSheets(
  competitionCode: string,
  dataArray: Array<any>,
) {
  try {
    const sheetId = getSheetIdByCompetition(competitionCode);

    if (!sheetId) {
      throw new Error(`No sheet ID configured for ${competitionCode}`);
    }

    const sheets = getGoogleSheetsClient();

    const formattedRows = dataArray.map((data) => [
      data.timestamp.toISOString(),
      data.competitionCode,
      data.teamName,
      data.leaderName,
      data.leaderEmail,
      data.leaderPhone,
      data.institution,
      data.memberCount,
      ...data.members.flatMap((member: any) => [
        member.name,
        member.email,
        member.phone,
      ]),
      data.referralCode || '-',
      data.paymentStatus,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: formattedRows,
      },
    });

    logger.info(
      `✅ Batch synced ${dataArray.length} registrations to Google Sheets`,
    );
    return { success: true, count: dataArray.length };
  } catch (error) {
    logger.error('❌ Batch sync to Google Sheets failed:', error as any);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ============================================================================
 * SUBMISSION LOGGING TO GOOGLE SHEETS
 * ============================================================================
 * Logs all submission activities (preliminary, payment, semifinal, final)
 * to a separate "Submissions" sheet for tracking and auditing
 * ============================================================================
 */

interface SubmissionLogData {
  timestamp?: Date;
  teamName: string;
  leaderEmail: string;
  competitionCode: string;
  submissionPhase: 'preliminary' | 'payment' | 'semifinal' | 'final';
  fileUrl?: string;
  fileName?: string;
  status: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export async function logSubmissionToSheets(data: SubmissionLogData) {
  try {
    const sheets = getGoogleSheetsClient();

    // Use the same sheet IDs as registrations (add "Submissions" tab)
    const sheetId = getSheetIdByCompetition(data.competitionCode);

    if (!sheetId) {
      logger.error(
        `❌ No sheet ID found for competition: ${data.competitionCode}`,
      );
      return { success: false, error: 'Sheet ID not configured' };
    }

    const timestamp = data.timestamp || new Date();
    const formattedDate = timestamp.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Row data for Submissions sheet
    const row = [
      formattedDate, // A: Timestamp
      data.teamName, // B: Team Name
      data.leaderEmail, // C: Leader Email
      data.competitionCode.toUpperCase(), // D: Competition
      data.submissionPhase.toUpperCase(), // E: Phase
      data.fileUrl || '', // F: File URL
      data.fileName || '', // G: File Name
      data.status.toUpperCase(), // H: Status
      data.reviewedBy || '', // I: Reviewed By
      data.reviewNotes || '', // J: Review Notes
    ];

    // Append to "Submissions" sheet (create if doesn't exist)
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Submissions!A:J', // Target the Submissions tab
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    logger.info(
      `✅ Logged ${data.submissionPhase} submission for ${data.teamName} to Google Sheets`,
    );
    return { success: true };
  } catch (error) {
    logger.error('❌ Failed to log submission to Google Sheets:', error as any);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
