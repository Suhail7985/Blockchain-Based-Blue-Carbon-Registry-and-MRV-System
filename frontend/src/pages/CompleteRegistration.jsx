import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeRegistration } from '../services/api';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

const CompleteRegistration = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const email = sessionStorage.getItem('signupEmail');

  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const validatePassword = (pwd) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd),
    };
  };

  const passwordRequirements = validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }

    const requirements = validatePassword(password);
    if (!Object.values(requirements).every((req) => req)) {
      setError('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      const result = await completeRegistration(email, name.trim(), password);
      if (result.success) {
        sessionStorage.removeItem('signupEmail');
        sessionStorage.removeItem('otpExpiresAt');
        navigate('/login', { 
          state: { message: 'Registration successful. Please login to continue.' }
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create account. Please try again.'
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
            <FaUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gov-blue-900">
            Complete Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 3 of 3: Enter your details to complete registration
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-base font-semibold text-gray-900">{email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name (as per ID) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue-500 focus:border-gov-blue-500 disabled:opacity-50"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue-500 focus:border-gov-blue-500 disabled:opacity-50"
                placeholder="Create a strong password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs">
                <p className="font-semibold mb-2 text-gray-700">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-600'}`}>
                    <FaCheckCircle className={`w-3 h-3 ${passwordRequirements.length ? '' : 'opacity-30'}`} />
                    Minimum 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-600'}`}>
                    <FaCheckCircle className={`w-3 h-3 ${passwordRequirements.uppercase ? '' : 'opacity-30'}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-600'}`}>
                    <FaCheckCircle className={`w-3 h-3 ${passwordRequirements.lowercase ? '' : 'opacity-30'}`} />
                    One lowercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-600'}`}>
                    <FaCheckCircle className={`w-3 h-3 ${passwordRequirements.number ? '' : 'opacity-30'}`} />
                    One number
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-600'}`}>
                    <FaCheckCircle className={`w-3 h-3 ${passwordRequirements.special ? '' : 'opacity-30'}`} />
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className={`block w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue-500 disabled:opacity-50 ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gov-blue-500'
                }`}
                placeholder="Re-enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 mt-1 text-gov-blue-600 focus:ring-gov-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
              I accept the{' '}
              <a href="#terms" className="text-gov-blue-600 hover:text-gov-blue-700 font-medium">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-gov-blue-600 hover:text-gov-blue-700 font-medium">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className="w-full py-3 px-4 bg-gov-blue-600 text-white font-semibold rounded-lg hover:bg-gov-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Complete Registration'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/verify-otp')}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;
