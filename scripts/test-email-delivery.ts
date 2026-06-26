/**
 * Test Email Delivery - Check if emails reach inbox
 */
import 'dotenv/config';

const BASE_URL = 'http://localhost:3000';

async function testEmailDelivery() {
  console.log('📧 Testing Email Delivery to Gmail\n');

  const timestamp = Date.now();
  const testEmail = 'imd 2026 at itbieeewebsite@gmail.com'; // Your actual Gmail

  console.log('📝 Registering new user...');
  console.log(`   Email: ${testEmail}`);
  console.log('   ⚠️  Note: Using imd 2026 at itbieeewebsite@gmail.com directly\n');

  try {
    const response = await fetch(`${BASE_URL}/api/competitions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitionCode: 'TPC',
        teamName: `Email Delivery Test ${timestamp}`,
        institution: 'Test University',
        leaderName: 'Test User',
        leaderEmail: testEmail,
        leaderPhone: '081234567890',
        leaderPassword: 'TestPassword123!',
        members: [],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log(`   Team: ${data.registration.teamName}\n`);

      console.log('📬 Email Status:');
      console.log('   ✅ Email should have been sent via Brevo SMTP');
      console.log('   📧 Check inbox: imd 2026 at itbieeewebsite@gmail.com');
      console.log('   📁 Also check: Spam/Junk folder');
      console.log('   🔍 Search for: "Activate Your IMD 2026 at ITB Account"\n');

      console.log('🌐 Alternative checks:');
      console.log('   1. Brevo Dashboard: https://app.brevo.com/log');
      console.log('   2. Gmail search: from:imd 2026 at itbieeewebsite@gmail.com');
      console.log('   3. Check "All Mail" folder in Gmail\n');

      console.log('⚠️  If still not received:');
      console.log('   - Email might be in Spam/Junk');
      console.log('   - Brevo sender email might need verification');
      console.log('   - Gmail might be filtering it out');
      console.log('   - Check Brevo logs for delivery status');
    } else {
      console.log('❌ Registration failed:', data.error);
      if (data.error?.includes('already')) {
        console.log(
          '\n💡 Tip: Email already registered. Try resend activation:',
        );
        console.log(`   POST ${BASE_URL}/api/auth/resend-activation`);
        console.log(`   { "email": "${testEmail}" }`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmailDelivery();
