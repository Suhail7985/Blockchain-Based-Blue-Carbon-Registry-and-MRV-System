import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import CompleteRegistration from './pages/CompleteRegistration';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Transparency from './pages/Transparency';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PortalLayout from './components/portal/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import ProfileKYC from './pages/portal/ProfileKYC';
import LandRegistration from './pages/portal/LandRegistration';
import PlantationSubmission from './pages/portal/PlantationSubmission';
import CarbonCredits from './pages/portal/CarbonCredits';
import BlockchainRecords from './pages/portal/BlockchainRecords';
import IntegrityExplorer from './pages/IntegrityExplorer';
import MyPlantations from './pages/MyPlantations';
import NationalImpactDashboard from './pages/portal/NationalImpactDashboard';
import PlantationGIS from './pages/portal/PlantationGIS';
import HealthMonitoring from './pages/portal/HealthMonitoring';
import AdvancedAnalysis from './pages/portal/AdvancedAnalysis';
import CorporateDashboard from './pages/portal/CorporateDashboard';
import PanchayatDashboard from './pages/portal/PanchayatDashboard';
import NccrDashboard from './pages/portal/NccrDashboard';
import AdminDashboard from './pages/portal/AdminDashboard';
import NgoDashboard from './pages/portal/NgoDashboard';
import CarbonLedger from './pages/portal/CarbonLedger';
import './App.css';

function PortalIndex() {
  const { user } = useAuth();
  if (user?.role === 'panchayat') return <Navigate to="/portal/panchayat" replace />;
  if (user?.role === 'ngo') return <Navigate to="/portal/ngo" replace />;
  if (user && (user.role === 'admin' || user.role === 'verifier')) return <AdminDashboard />;
  return <PortalDashboard />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/complete-registration" element={<CompleteRegistration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/explorer" element={<IntegrityExplorer />} />

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
                  <Route path="my-plantations" element={<MyPlantations />} />
                  <Route path="carbon" element={<CarbonCredits />} />
                  <Route path="blockchain" element={<BlockchainRecords />} />
                  <Route path="ledger" element={<CarbonLedger />} />
                  <Route path="panchayat" element={<PanchayatDashboard />} />
                  <Route path="nccr" element={<NccrDashboard />} />
                  <Route path="ngo" element={<NgoDashboard />} />
                  <Route path="impact" element={<NationalImpactDashboard />} />
                  <Route path="gis" element={<PlantationGIS />} />
                  <Route path="health" element={<HealthMonitoring />} />
                  <Route path="analysis/advanced" element={<AdvancedAnalysis />} />
                  <Route path="marketplace" element={<CorporateDashboard />} />
                </Route>

                {/* Redirect legacy dashboard */}
                <Route path="/dashboard" element={<Navigate to="/portal" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
