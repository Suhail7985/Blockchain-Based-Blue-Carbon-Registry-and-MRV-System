import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return toast.error('Passwords do not match.');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success('Password reset successfully! Please log in.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = () => {
    if (!password) return null;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[@$!%*?&]/.test(password),
    ];
    const passed = checks.filter(Boolean).length;
    if (passed <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (passed === 2) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4' };
    if (passed === 3) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = pwStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-blue-800/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-900/10 to-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-teal-600 mb-4 shadow-xl">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-teal-700 bg-clip-text text-transparent mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${strength.color} ${strength.width} transition-all`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Strength: <span className="font-semibold">{strength.label}</span></p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Min 8 chars, including uppercase, number & special character</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 transition-all bg-white ${
                  confirm && password !== confirm ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Confirm your new password"
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">⚠️ Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirm && password !== confirm)}
              className="w-full bg-gradient-to-r from-blue-900 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⏳</span> Resetting...</>
              ) : (
                <>✅ Reset Password</>
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <Link to="/login" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
