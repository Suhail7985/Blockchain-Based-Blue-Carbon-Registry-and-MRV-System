import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute - wraps routes that require authentication.
 * 
 * Usage:
 *   <Route element={<ProtectedRoute />}> — any logged-in user
 *   <Route element={<ProtectedRoute allowedRoles={['admin', 'verifier']} />}> — role check
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Require email verification
  if (!user.isEmailVerified) {
    return <Navigate to="/login" replace state={{ message: 'Please verify your email before accessing this resource.' }} />;
  }

  // Role check (if allowedRoles specified)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard instead of 403
      const roleRedirects = {
        citizen: '/portal',
        ngo: '/portal/ngo',
        community: '/portal',
        panchayat: '/portal/panchayat',
        admin: '/portal/nccr',
        verifier: '/portal/nccr',
      };
      return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
