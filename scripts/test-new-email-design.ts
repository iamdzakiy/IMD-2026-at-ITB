import 'dotenv/config';
import {
  sendActivationEmail,
  sendRegistrationApprovedEmail,
  sendRegistrationRejectedEmail,
  sendPasswordResetEmail,
} from '../src/lib/email';

async function testNewEmailDesign() {
  console.log('🎨 Testing New Email Design\n');
  console.log('='.repeat(50));

  const testEmail =
    process.env.SMTP_USER || 'imd 2026 at itbieeewebsite@gmail.com';

  try {
    // Test all 4 email templates
    console.log('\n📧 Sending all email templates...\n');

    await Promise.all([
      sendActivationEmail(testEmail, 'Test User', 'test-token-12345'),
      sendRegistrationApprovedEmail(
        testEmail,
        'Test User',
        'Team Innovators',
        'Business Case Competition (BCC)',
      ),
      sendRegistrationRejectedEmail(
        testEmail,
        'Test User',
        'Team Test',
        'Incomplete team information',
      ),
      sendPasswordResetEmail(testEmail, 'Test User', 'reset-token-67890'),
    ]);

    console.log('='.repeat(50));
    console.log('\n🎉 All email templates sent successfully!');
    console.log(`\n📧 Check inbox at: ${testEmail}`);
    console.log('📬 Also check Spam/Junk folder if not in inbox\n');
  } catch (error) {
    console.error('\n❌ Error testing emails:', error);
    throw error;
  }
}

testNewEmailDesign();
