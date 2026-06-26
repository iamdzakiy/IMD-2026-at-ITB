/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: SEND FORM SUBMISSIONS TO IMD 2026 at ITB
 * ============================================================================
 *
 * Setup Instructions:
 * 1. Open your Google Form
 * 2. Click ⋮ (three dots) → Script editor
 * 3. Paste this code
 * 4. Replace WEBHOOK_URL and WEBHOOK_SECRET with your values
 * 5. Save and set up trigger:
 *    - Click ⏰ (Triggers icon in left sidebar)
 *    - Add Trigger
 *    - Function: onFormSubmit
 *    - Event source: From form
 *    - Event type: On form submit
 *    - Save
 *
 * Form Structure Required:
 * - Competition Code (PTC/TPC/BCC)
 * - Team Name
 * - Institution
 * - Leader Name
 * - Leader Email
 * - Leader Phone
 * - Member 1 Name, Email, Phone (optional)
 * - Member 2 Name, Email, Phone (optional)
 * - Member 3 Name, Email, Phone (optional)
 * - Member 4 Name, Email, Phone (optional, for PTC max 5 members)
 * ============================================================================
 */

// ⚙️ CONFIGURATION - REPLACE THESE VALUES
const WEBHOOK_URL = 'https://yourdomain.com/api/webhooks/import-registration';
const WEBHOOK_SECRET = 'your-webhook-secret-here'; // Generate: openssl rand -base64 32

/**
 * Triggered automatically when form is submitted
 */
function onFormSubmit(e) {
  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();

    // Map form responses to field names
    const responses = {};
    itemResponses.forEach((itemResponse) => {
      const question = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      responses[question] = answer;
    });

    // Extract data based on your form questions
    // ⚠️ ADJUST THESE KEYS TO MATCH YOUR GOOGLE FORM QUESTIONS
    const payload = {
      competitionCode:
        responses['Competition Code'] || responses['Kode Kompetisi'], // PTC/TPC/BCC
      teamName: responses['Team Name'] || responses['Nama Tim'],
      institution: responses['Institution'] || responses['Institusi'],
      leaderName: responses['Leader Name'] || responses['Nama Ketua'],
      leaderEmail: responses['Leader Email'] || responses['Email Ketua'],
      leaderPhone: responses['Leader Phone'] || responses['Nomor HP Ketua'],
      members: [],
    };

    // Extract team members (up to 4 members, excluding leader)
    for (let i = 1; i <= 4; i++) {
      const memberName =
        responses[`Member ${i} Name`] || responses[`Nama Anggota ${i}`];
      const memberEmail =
        responses[`Member ${i} Email`] || responses[`Email Anggota ${i}`];
      const memberPhone =
        responses[`Member ${i} Phone`] || responses[`Nomor HP Anggota ${i}`];

      if (memberName) {
        payload.members.push({
          name: memberName,
          email: memberEmail || '',
          phone: memberPhone || '',
        });
      }
    }

    // Send to webhook
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 201 || responseCode === 200) {
      console.log('✅ Registration sent successfully:', responseBody);
    } else if (responseCode === 409) {
      console.log('⚠️ Duplicate registration detected:', responseBody);
    } else {
      console.error('❌ Webhook failed:', responseCode, responseBody);
    }
  } catch (error) {
    console.error('❌ Error in onFormSubmit:', error.toString());

    // Optional: Send error notification email
    // MailApp.sendEmail('admin@imd 2026 at itb.IMD 2026 at ITB-itb.org', 'Form Submission Error', error.toString());
  }
}

/**
 * Test function - run manually to test webhook
 */
function testWebhook() {
  const testPayload = {
    competitionCode: 'PTC',
    teamName: 'Test Team from Apps Script',
    institution: 'Test University',
    leaderName: 'Test Leader',
    leaderEmail: 'testgform@example.com',
    leaderPhone: '081234567890',
    members: [
      {
        name: 'Member 1',
        email: 'member1gform@example.com',
        phone: '081234567891',
      },
      {
        name: 'Member 2',
        email: 'member2gform@example.com',
        phone: '081234567892',
      },
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${WEBHOOK_SECRET}`,
    },
    payload: JSON.stringify(testPayload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  console.log('Response Code:', response.getResponseCode());
  console.log('Response Body:', response.getContentText());
}
