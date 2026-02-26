import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import Navigation from './components/Navigation';
import PlantationForm from './components/PlantationForm';
// Remove unused imports once pages are fully separate, for now keeping page imports
import AdminDashboard from './pages/AdminDashboard';
import Verification from './pages/Verification';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import MyPlantations from './pages/MyPlantations';
import ProtectedRoute from './components/auth/ProtectedRoute';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'user') return <Navigate to="/dashboard/user" />;
  if (user.role === 'panchayat') return <Navigate to="/dashboard/panchayat" />;
  if (user.role === 'nccr') return <Navigate to="/dashboard/admin" />;
  return <Navigate to="/login" />;
}

// Wrapper for layout
function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {isAuthenticated && !isAuthPage && <Navigation />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="glass border-t border-gray-200/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-600 mb-4 md:mb-0">
                <p className="font-semibold text-gray-800 mb-1">🌍 Blue Carbon Registry</p>
                <p className="text-xs">Blockchain-Based MRV System</p>
                <p className="text-xs mt-1">Ministry of Earth Sciences (MoES) - NCCR</p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">About</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Documentation</a>
                <a href="#" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Contact</a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200/50 text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Blue Carbon Registry. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function MainRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <RoleRedirect /> : <Login onSwitchToRegister={() => window.location.href = '/register'} />} />
        <Route path="/register" element={isAuthenticated ? <RoleRedirect /> : <Register onSwitchToLogin={() => window.location.href = '/login'} />} />
        <Route path="/verify-email" element={isAuthenticated ? <RoleRedirect /> : <VerifyEmail />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/dashboard/user" element={<MyPlantations />} />
          <Route path="/submit" element={
            <div className="max-w-3xl mx-auto">
              <PlantationForm onNewPlantation={() => { }} />
            </div>
          } />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['panchayat']} />}>
          <Route path="/dashboard/panchayat" element={<div>Panchayat Dashboard Component Here</div>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['nccr']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <MainRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
