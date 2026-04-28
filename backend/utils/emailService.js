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

// Verify transporter configuration - only when SMTP creds are present
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service configuration error:', error.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.warn('⚠️  SMTP credentials not set - email sending will be disabled.');
}

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

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'CarbonSetu — Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #065f46; margin: 0;">🌊 CarbonSetu</h2>
            <p style="color: #6b7280; font-size: 13px;">Ministry of Earth Sciences — NCCR</p>
          </div>
          <h3 style="color: #1f2937;">Password Reset Request</h3>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
            You requested a password reset for your CarbonSetu account. Click the button below to reset your password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #0284c7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">
            This link will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            If the button doesn't work, copy and paste this URL: ${resetUrl}
          </p>
        </div>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

export const sendPlantationStatusEmail = async (email, userName, plantationId, status, details = {}) => {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `🌱 Plantation ${plantationId} — Approved & Carbon Credits Issued`
    : `❌ Plantation ${plantationId} — Verification Update`;

  const bodyContent = isApproved
    ? `
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Great news! Your plantation <strong>${plantationId}</strong> has been verified and approved by the Local Panchayat.
        </p>
        <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #065f46; margin: 0 0 8px;">Carbon Credits Issued</h4>
          <p style="margin: 4px 0; color: #374151;">CO₂ Captured: <strong>${details.co2eq || '—'} tonnes</strong></p>
          <p style="margin: 4px 0; color: #374151;">BCC Tokens Minted: <strong>${details.tokens || '—'} BCC</strong></p>
          ${details.txHash ? `<p style="margin: 4px 0; color: #374151;">Blockchain TX: <a href="https://amoy.polygonscan.com/tx/${details.txHash}" style="color: #059669;">${details.txHash.slice(0,20)}...</a></p>` : ''}
        </div>
        <p style="color: #4b5563;">Log in to your dashboard to view the full details and your token balance.</p>
      `
    : `
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
          Your plantation submission <strong>${plantationId}</strong> could not be verified at this time.
        </p>
        ${details.reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0;"><h4 style="color: #991b1b; margin: 0 0 8px;">Reason</h4><p style="color: #374151; margin: 0;">${details.reason}</p></div>` : ''}
        <p style="color: #4b5563;">You may re-submit your plantation after addressing the concerns raised. Log in to your dashboard for more details.</p>
      `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #065f46; margin: 0;">🌊 CarbonSetu</h2>
            <p style="color: #6b7280; font-size: 13px;">Ministry of Earth Sciences — NCCR</p>
          </div>
          <h3 style="color: #1f2937;">Dear ${userName},</h3>
          ${bodyContent}
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            © ${new Date().getFullYear()} CarbonSetu — NCCR, Ministry of Earth Sciences.
          </p>
        </div>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Plantation status email sent to ${email}:`, info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending plantation status email:', error);
    // Don't throw — email failure should not block the approval response
    return { success: false, error: error.message };
  }
};

export default transporter;
