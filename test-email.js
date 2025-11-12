// Test Email Configuration
// Run this with: node test-email.js

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
  console.log('');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ Missing SMTP credentials in .env.local');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log('🔌 Testing SMTP connection...');
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n💡 Common issues:');
    console.log('1. Gmail App Password: Make sure you generated an App Password (not your regular password)');
    console.log('   Go to: https://myaccount.google.com/apppasswords');
    console.log('2. Less secure apps: Enable "Less secure app access" in Gmail settings');
    console.log('3. Password format: Remove spaces from password (should be 16 characters)');
    process.exit(1);
  }

  // Send test email
  console.log('📧 Sending test email...');
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: '✅ Ghosty Email Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">✅ Email Configuration Working!</h1>
          <p>Your Ghosty email configuration is set up correctly.</p>
          <ul>
            <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
          </ul>
          <p style="color: #666; font-size: 14px;">
            Time: ${new Date().toLocaleString()}<br>
            Test: Ghosty Registration Email System
          </p>
        </div>
      `,
      text: 'Email configuration test successful! Your Ghosty email system is working correctly.',
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n✨ Check your inbox:', process.env.SMTP_USER);
    console.log('📧 If you received the email, your configuration is correct!\n');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    process.exit(1);
  }
}

testEmail();
