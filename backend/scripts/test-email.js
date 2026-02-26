/**
 * Test Email Configuration
 * Run this script to test if email configuration is working
 * Usage: node scripts/test-email.js
 */

import dotenv from 'dotenv';
import { sendOTPEmail } from '../utils/emailService.js';

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587 (default)');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Not set');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS is not set in .env file');
    console.log('\nPlease add these to your backend/.env file:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    process.exit(1);
  }

  // Test email sending
  const testEmailAddress = process.env.EMAIL_USER; // Send to yourself for testing
  const testOTP = '123456';

  console.log(`📧 Sending test email to: ${testEmailAddress}`);
  console.log(`🔑 Test OTP: ${testOTP}\n`);

  try {
    const result = await sendOTPEmail(testEmailAddress, testOTP);
    console.log('✅ SUCCESS! Email sent successfully');
    console.log('Message ID:', result.messageId);
    console.log('\nCheck your inbox for the test email.');
  } catch (error) {
    console.error('❌ FAILED to send email');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication Error:');
      console.error('This usually means:');
      console.error('1. Wrong email or password');
      console.error('2. For Gmail: You need to use an App Password, not your regular password');
      console.error('3. 2-Step Verification must be enabled');
      console.error('\nGet App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection Error:');
      console.error('Cannot connect to email server. Check EMAIL_HOST and EMAIL_PORT');
    } else {
      console.error('\nFull error details:', error);
    }
    
    process.exit(1);
  }
};

testEmail();
