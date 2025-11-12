import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendActivationEmailParams {
  to: string;
  activationToken: string;
}

export async function sendActivationEmail({
  to,
  activationToken,
}: SendActivationEmailParams) {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/activate?token=${activationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '👻 Activate Your Ghosty Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              border-radius: 10px;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
            }
            h1 {
              color: white;
              font-size: 32px;
              margin: 0 0 10px 0;
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              color: white;
              font-size: 12px;
              margin-top: 20px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              font-size: 14px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">👻</div>
            <h1>Welcome to Ghosty!</h1>
            <div class="content">
              <h2>Activate Your Account</h2>
              <p>Thanks for joining Ghosty! Click the button below to activate your account and start your anonymous dating journey.</p>
              
              <a href="${activationUrl}" class="button">Activate Account</a>
              
              <div class="warning">
                ⚠️ <strong>Security Notice:</strong> This link will expire in 24 hours. If you didn't create a Ghosty account, please ignore this email.
              </div>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Or copy and paste this link in your browser:<br>
                <a href="${activationUrl}" style="color: #667eea; word-break: break-all;">${activationUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Ghosty. All rights reserved.</p>
              <p>Find your match anonymously 💜</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Ghosty! 👻

Thanks for joining! Click the link below to activate your account:

${activationUrl}

This link will expire in 24 hours.

If you didn't create a Ghosty account, please ignore this email.

© 2025 Ghosty - Find your match anonymously 💜
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending activation email:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Command:', error.command);
    console.error('Full Error:', error);
    throw error; // Throw original error instead of generic message
  }
}
