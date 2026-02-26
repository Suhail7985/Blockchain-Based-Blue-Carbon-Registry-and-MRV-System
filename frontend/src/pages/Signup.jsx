import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP } from '../services/api';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';

const Signup = () => {
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
        sessionStorage.setItem('signupEmail', email);
        if (result.expiresAt) {
          sessionStorage.setItem('otpExpiresAt', result.expiresAt);
        }
        navigate('/verify-otp');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send OTP. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-blue-50 via-white to-carbon-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-xl p-8 border-2 border-gov-blue-200">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gov-blue-600 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gov-blue-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 1 of 3: Enter your official email address
          </p>
        </div>

        {/* Government Notice */}
        <div className="bg-blue-50 border-l-4 border-gov-blue-600 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gov-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gov-blue-700">
                <strong>Government Portal:</strong> Use your official email address for registration. 
                An OTP will be sent to verify your identity.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Official Email ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue-500 focus:border-gov-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use your official email address as per government records
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gov-blue-600 hover:bg-gov-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                <span className="flex items-center">
                  Continue
                  <FaArrowRight className="ml-2 w-5 h-5" />
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-gov-blue-600 hover:text-gov-blue-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
