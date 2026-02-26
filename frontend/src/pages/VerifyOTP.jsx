import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../services/api';
import { FaShieldAlt, FaClock, FaRedo } from 'react-icons/fa';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = sessionStorage.getItem('signupEmail');
  const otpExpiresAt = sessionStorage.getItem('otpExpiresAt');

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    // Initialize countdown timer
    if (otpExpiresAt) {
      const expiryTime = new Date(otpExpiresAt).getTime();
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          setError('OTP has expired. Please request a new one.');
        }
      };
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [email, navigate, otpExpiresAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (timeLeft === 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(email, otpString);
      if (result.success) {
        navigate('/complete-registration');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid OTP. Please try again.'
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || resendAttempts >= 3) return;

    setResending(true);
    setError('');

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setResendAttempts(prev => prev + 1);
        setResendCooldown(60);
        setTimeLeft(300);
        setOtp(['', '', '', '', '', '']);
        if (result.expiresAt) {
          sessionStorage.setItem('otpExpiresAt', result.expiresAt);
        }
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to resend OTP. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-blue-50 via-white to-carbon-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-xl p-8 border-2 border-gov-blue-200">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gov-blue-600 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gov-blue-900">
            Verify Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 2 of 3: Enter the OTP sent to your email
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-base font-semibold text-gray-900">{email}</p>
        </div>

        {/* Government Message */}
        <div className="bg-blue-50 border-l-4 border-gov-blue-600 p-4 rounded">
          <p className="text-sm text-gov-blue-700">
            <strong>An OTP has been sent to your registered email address.</strong> 
            Please check your inbox and enter the 6-digit code below.
          </p>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}>
            <FaClock className="w-5 h-5" />
            <span className="font-semibold">
              {timeLeft > 0 ? `Expires in: ${formatTime(timeLeft)}` : 'OTP Expired'}
            </span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading || timeLeft === 0}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-gov-blue-100 border-gray-300 focus:border-gov-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6 || timeLeft === 0}
            className="w-full py-3 px-4 bg-gov-blue-600 text-white font-semibold rounded-lg hover:bg-gov-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending || resendAttempts >= 3}
              className="text-gov-blue-600 hover:text-gov-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <FaRedo className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resendAttempts >= 3
                ? 'Maximum resend attempts reached'
                : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : resending
                ? 'Resending...'
                : "Didn't receive code? Resend"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('signupEmail');
              sessionStorage.removeItem('otpExpiresAt');
              navigate('/signup');
            }}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Change Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
