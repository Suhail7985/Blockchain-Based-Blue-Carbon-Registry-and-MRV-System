import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeRegistration } from '../services/api';

const ProfileStep = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const email = sessionStorage.getItem('signupEmail');

  React.useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  const validatePassword = (pwd) => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
        navigate('/success');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          Almost there! Just add your name and create a secure password.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-base font-semibold text-gray-900">{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="John Doe"
              required
              disabled={loading}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                error && !name.trim()
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Create a strong password"
              required
              disabled={loading}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                error && password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {password && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : ''}`}>
                    <span>{passwordRequirements.length ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : ''}`}>
                    <span>{passwordRequirements.uppercase ? '✓' : '○'}</span>
                    <span>One uppercase letter</span>
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600' : ''}`}>
                    <span>{passwordRequirements.lowercase ? '✓' : '○'}</span>
                    <span>One lowercase letter</span>
                  </li>
                  <li className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-green-600' : ''}`}>
                    <span>{passwordRequirements.number ? '✓' : '○'}</span>
                    <span>One number</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                error && confirmPassword && password !== confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {confirmPassword &&
              password !== confirmPassword &&
              !error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <span>⚠️</span>
                  <span>Passwords do not match</span>
                </div>
              )}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none mb-4"
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
              'Create Account'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/verify-otp')}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-base transition-all hover:bg-gray-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileStep;
