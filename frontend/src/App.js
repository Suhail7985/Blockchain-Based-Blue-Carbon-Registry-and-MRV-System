import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import CompleteRegistration from './pages/CompleteRegistration';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PortalLayout from './components/portal/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import ProfileKYC from './pages/portal/ProfileKYC';
import LandRegistration from './pages/portal/LandRegistration';
import PlantationSubmission from './pages/portal/PlantationSubmission';
import CarbonCredits from './pages/portal/CarbonCredits';
import BlockchainRecords from './pages/portal/BlockchainRecords';
import Notifications from './pages/portal/Notifications';
import PanchayatDashboard from './pages/portal/PanchayatDashboard';
import NccrDashboard from './pages/portal/NccrDashboard';
import NgoDashboard from './pages/portal/NgoDashboard';
import CarbonLedger from './pages/portal/CarbonLedger';
import './App.css';

function PortalIndex() {
  const { user } = useAuth();
  if (user?.role === 'panchayat') return <Navigate to="/portal/panchayat" replace />;
  if (user?.role === 'ngo') return <Navigate to="/portal/ngo" replace />;
  if (user && (user.role === 'admin' || user.role === 'verifier')) return <Navigate to="/portal/nccr" replace />;
  return <PortalDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />

            {/* Portal - Protected */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PortalIndex />} />
              <Route path="profile" element={<ProfileKYC />} />
              <Route path="land" element={<LandRegistration />} />
              <Route path="plantation" element={<PlantationSubmission />} />
              <Route path="carbon" element={<CarbonCredits />} />
              <Route path="blockchain" element={<BlockchainRecords />} />
              <Route path="ledger" element={<CarbonLedger />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="panchayat" element={<PanchayatDashboard />} />
              <Route path="nccr" element={<NccrDashboard />} />
              <Route path="ngo" element={<NgoDashboard />} />
            </Route>

            {/* Redirect legacy dashboard */}
            <Route path="/dashboard" element={<Navigate to="/portal" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

