import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendar, FaCheckCircle } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gov-blue-900 dark:text-white">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Blue Carbon Registry Dashboard
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FaUser className="w-6 h-6 text-gov-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Full Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FaEnvelope className="w-6 h-6 text-gov-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Verification Status</p>
                <p className="font-semibold text-green-600">Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FaCalendar className="w-6 h-6 text-gov-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Member Since</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gov-blue-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-gov-blue-50 dark:bg-gray-700 rounded-lg hover:bg-gov-blue-100 dark:hover:bg-gray-600 transition-colors text-left">
              <h3 className="font-semibold text-gov-blue-900 dark:text-white">Submit Plantation Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Upload new restoration data</p>
            </button>
            <button className="p-4 bg-gov-blue-50 dark:bg-gray-700 rounded-lg hover:bg-gov-blue-100 dark:hover:bg-gray-600 transition-colors text-left">
              <h3 className="font-semibold text-gov-blue-900 dark:text-white">View My Submissions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Check your submitted data</p>
            </button>
            <button className="p-4 bg-gov-blue-50 dark:bg-gray-700 rounded-lg hover:bg-gov-blue-100 dark:hover:bg-gray-600 transition-colors text-left">
              <h3 className="font-semibold text-gov-blue-900 dark:text-white">Carbon Credits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">View your carbon credits</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
