import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, sendOTP } from '../services/api';

const OTPStep = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = sessionStorage.getItem('signupEmail');
  const otpExpiresAt = sessionStorage.getItem('otpExpiresAt');

  useEffect(() => {
    if (!email) {
      navigate('/');
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
    } else {
      // Fallback: start 5-minute timer
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setError('OTP has expired. Please request a new one.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [email, navigate, otpExpiresAt]);

  useEffect(() => {
    // Start resend cooldown timer
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
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
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
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid OTP. Please try again.'
      );
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setResendCooldown(60); // 60 second cooldown
        setTimeLeft(300); // Reset timer to 5 minutes
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a 6-digit code to your email address.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-base font-semibold text-gray-900">{email}</p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">
              {timeLeft > 0 ? `Expires in: ${formatTime(timeLeft)}` : 'OTP Expired'}
            </span>
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex gap-3 justify-center mb-6">
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
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                  error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6 || timeLeft === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none mb-4"
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
              'Verify Code'
            )}
          </button>

          <div className="text-center mb-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
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
              navigate('/');
            }}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-base transition-all hover:bg-gray-200 hover:shadow-md"
          >
            Change Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPStep;
