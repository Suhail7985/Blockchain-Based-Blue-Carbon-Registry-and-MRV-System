import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set in .env file. Email functionality will not work.');
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add connection timeout
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    replyTo: process.env.EMAIL_NOREPLY || process.env.EMAIL_FROM || 'noreply@bluecarbon-registry.gov.in',
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
    },
    subject: 'Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for signing up! Please use the following code to verify your email address:
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center; margin: 30px 0;">
            <h1 style="color: #1f2937; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">
              ${otp}
            </h1>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
            Please do not reply to this email. This is an automated message and replies are not monitored.
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} Your App. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

export default transporter;
