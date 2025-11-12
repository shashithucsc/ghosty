import { NextRequest, NextResponse } from 'next/server';
import { sendActivationEmail } from '@/lib/email/sendEmail';

// Test endpoint to verify email configuration
// Access at: http://localhost:3000/api/test-email?to=your-email@gmail.com

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('to') || process.env.SMTP_USER;

  if (!testEmail) {
    return NextResponse.json(
      { 
        error: 'No email address provided. Use: /api/test-email?to=your-email@gmail.com',
        env: {
          SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
          SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
          SMTP_USER: process.env.SMTP_USER || 'NOT SET',
          SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET',
          EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
        }
      },
      { status: 400 }
    );
  }

  console.log('🧪 Testing email configuration...');
  console.log('📧 Sending test email to:', testEmail);
  console.log('📋 SMTP Config:');
  console.log('  - Host:', process.env.SMTP_HOST);
  console.log('  - Port:', process.env.SMTP_PORT);
  console.log('  - User:', process.env.SMTP_USER);
  console.log('  - Password:', process.env.SMTP_PASSWORD ? 'SET (length: ' + process.env.SMTP_PASSWORD.length + ')' : 'NOT SET');
  console.log('  - From:', process.env.EMAIL_FROM);

  try {
    await sendActivationEmail({
      to: testEmail,
      activationToken: 'TEST_TOKEN_12345',
    });

    console.log('✅ Test email sent successfully!');

    return NextResponse.json(
      {
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        details: {
          smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            from: process.env.EMAIL_FROM,
          },
          note: 'Check your inbox for the activation email with TEST_TOKEN_12345',
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Failed to send test email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send email',
        details: {
          errorType: error.name,
          errorMessage: error.message,
          errorCode: error.code,
          errorCommand: error.command,
          errorResponse: error.response,
          errorResponseCode: error.responseCode,
          smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            passwordSet: !!process.env.SMTP_PASSWORD,
            passwordLength: process.env.SMTP_PASSWORD?.length || 0,
          },
          solutions: [
            '🔑 Gmail App Password Issues:',
            '1. Go to https://myaccount.google.com/apppasswords',
            '2. If you see "App passwords are not recommended", you need to:',
            '   - Enable 2-Step Verification first at https://myaccount.google.com/signinoptions/two-step-verification',
            '   - Then return to App Passwords page',
            '3. Generate a NEW App Password:',
            '   - Select app: "Mail"',
            '   - Select device: "Other" → Type "Ghosty"',
            '   - Click Generate',
            '   - Copy the 16-character password (remove spaces)',
            '4. Update .env.local with the new password',
            '5. Restart dev server: Ctrl+C then npm run dev',
            '',
            '⚠️ Common Mistake: Using regular Gmail password instead of App Password',
          ]
        }
      },
      { status: 500 }
    );
  }
}
