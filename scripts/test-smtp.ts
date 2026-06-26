/**
 * Test SMTP Connection and Send Email
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testSMTP() {
  console.log('🔍 Testing SMTP Configuration...\n');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log(
    'Pass:',
    process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
  );

  try {
    // Test connection
    console.log('\n📡 Testing connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log(
      '📧 Sending test email to imd 2026 at itbieeewebsite@gmail.com...',
    );
    const info = await transporter.sendMail({
      from: `"The IMD 2026 at ITB Test" <${process.env.SMTP_USER}>`,
      to: 'imd 2026 at itbieeewebsite@gmail.com',
      subject: 'Test Email from IMD 2026 at ITB',
      html: `
        <h1>Test Email</h1>
        <p>If you receive this, SMTP is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n✉️  Check your inbox: imd 2026 at itbieeewebsite@gmail.com');
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testSMTP();
