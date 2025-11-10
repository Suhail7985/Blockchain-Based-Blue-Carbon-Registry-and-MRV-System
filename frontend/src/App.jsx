import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navigation from './components/Navigation';
import PlantationForm from './components/PlantationForm';
import PlantationList from './components/PlantationList';
import AdminDashboard from './pages/AdminDashboard';
import Verification from './pages/Verification';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import MyPlantations from './pages/MyPlantations';
import { FiFileText } from 'react-icons/fi';

function AppContent() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [showAuth, setShowAuth] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch plantations from backend
  const fetchPlantations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/plantations');
      if (response.ok) {
        const data = await response.json();
        setPlantations(data);
      }
    } catch (error) {
      console.error('Error fetching plantations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load plantations on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlantations();
    }
  }, [isAuthenticated]);

  const handleNewPlantation = (newPlantation) => {
    setPlantations([...plantations, newPlantation]);
  };

  const handleUpdatePlantation = (updatedPlantation) => {
    setPlantations(plantations.map(p => 
      p._id === updatedPlantation._id ? updatedPlantation : p
    ));
  };

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        {showAuth === 'login' ? (
          <Login onSwitchToRegister={() => setShowAuth('register')} />
        ) : (
          <Register onSwitchToLogin={() => setShowAuth('login')} />
        )}
      </div>
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard plantations={plantations} />
            </motion.div>
          )}

          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PlantationForm onNewPlantation={handleNewPlantation} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 mr-4 shadow-lg">
                      <FiFileText className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold gradient-text">Recent Submissions</h2>
                      <p className="text-gray-600 text-sm mt-1">Latest plantation data entries</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="text-center text-gray-500 py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                      <p>Loading plantations...</p>
                    </div>
                  ) : (
                    <PlantationList plantations={plantations.slice(0, 5)} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'my-plantations' && (
            <motion.div
              key="my-plantations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MyPlantations plantations={plantations} />
            </motion.div>
          )}

          {activeTab === 'verification' && isAdmin() && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Verification 
                plantations={plantations} 
                onUpdatePlantation={handleUpdatePlantation}
              />
            </motion.div>
          )}

          {activeTab === 'users' && isAdmin() && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserManagement />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfile />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-2xl shadow-xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold gradient-text mb-4">⚙️ Settings</h2>
              <p className="text-gray-600">Settings page coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
