import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP } from '../services/api';

const EmailStep = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendOTP(email);
      if (result.success) {
        // Store email and expiry time in sessionStorage
        sessionStorage.setItem('signupEmail', email);
        if (result.expiresAt) {
          sessionStorage.setItem('otpExpiresAt', result.expiresAt);
        }
        navigate('/verify-otp');
      }
    } catch (err) {
      // Provide more specific error messages
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.data?.error === 'Database error') {
        setError('Database connection error. Please contact support.');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to send OTP. Please ensure the backend server is running and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
        <p className="text-gray-600 mb-8">
          Enter your email address to get started. We'll send you a verification code.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              required
              disabled={loading}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailStep;
