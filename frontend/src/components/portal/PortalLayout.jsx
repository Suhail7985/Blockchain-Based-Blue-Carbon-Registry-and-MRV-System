import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaTachometerAlt,
  FaUser,
  FaMapMarkedAlt,
  FaSeedling,
  FaCoins,
  FaLink,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaLock,
  FaLandmark,
  FaShieldAlt,
} from 'react-icons/fa';
import { ACCOUNT_STATUS, STATUS_LABELS, STATUS_BADGE_CLASSES } from '../../constants/accountStatus';

const navItems = [
  { path: '/portal', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/portal/profile', icon: FaUser, label: 'Profile & KYC' },
  { path: '/portal/land', icon: FaMapMarkedAlt, label: 'Land Registration' },
  { path: '/portal/plantation', icon: FaSeedling, label: 'Plantation Submission' },
  { path: '/portal/carbon', icon: FaCoins, label: 'Carbon Credits' },
  { path: '/portal/blockchain', icon: FaLink, label: 'Blockchain Records' },
  { path: '/portal/notifications', icon: FaBell, label: 'Notifications' },
];

const panchayatNav = { path: '/portal/panchayat', icon: FaLandmark, label: 'Panchayat Verification', roles: ['panchayat'] };
const nccrNav = { path: '/portal/nccr', icon: FaShieldAlt, label: 'NCCR Approval', roles: ['admin', 'verifier'] };

const restrictedPaths = ['/portal/land', '/portal/carbon', '/portal/blockchain'];

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isRestricted = (path) => restrictedPaths.includes(path) && !isActive;

  const hideForRole = (path) => {
    if (!user) return false;
    if (user.role === 'panchayat') {
      // Hide citizen-only items for Panchayat
      return path === '/portal/plantation' || path === '/portal/carbon';
    }
    if (user.role === 'ngo') {
      // NGO focuses on its own dashboard; hide citizen KYC land/plantation/carbon/blockchain
      return (
        path === '/portal/land' ||
        path === '/portal/plantation' ||
        path === '/portal/carbon' ||
        path === '/portal/blockchain'
      );
    }
    if (user.role === 'admin' || user.role === 'verifier') {
      // NCCR users use admin dashboards; hide citizen plantation/carbon
      return path === '/portal/plantation' || path === '/portal/carbon';
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 fixed h-full z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-bc-green-600 rounded flex items-center justify-center">
              <span className="text-white text-2xl">🌊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">National Blue Carbon Registry</h1>
              <p className="text-xs text-gray-500">MoES / NCCR</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            if (hideForRole(item.path)) return null;
            const restricted = isRestricted(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={restricted ? '#' : item.path}
                end={item.path === '/portal'}
                onClick={(e) => restricted && e.preventDefault()}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                    restricted
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : active
                      ? 'bg-bc-green-50 text-bc-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {restricted && <FaLock className="w-4 h-4 shrink-0" />}
                {!restricted && <Icon className="w-5 h-5 shrink-0" />}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {panchayatNav.roles.includes(user?.role) && (
            <NavLink
              to={panchayatNav.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-bc-green-50 text-bc-green-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaLandmark className="w-5 h-5 shrink-0" />
              <span>{panchayatNav.label}</span>
            </NavLink>
          )}
          {nccrNav.roles.includes(user?.role) && (
            <NavLink
              to={nccrNav.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-bc-green-50 text-bc-green-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaShieldAlt className="w-5 h-5 shrink-0" />
              <span>{nccrNav.label}</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <span className="font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <nav className="py-4">
              {navItems.map((item) => {
                if (hideForRole(item.path)) return null;
                const restricted = isRestricted(item.path);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={restricted ? '#' : item.path}
                    end={item.path === '/portal'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive: active }) =>
                      `flex items-center gap-3 px-6 py-3 ${
                        restricted ? 'text-gray-400' : active ? 'bg-bc-green-50' : ''
                      }`
                    }
                  >
                    {restricted ? <FaLock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              {panchayatNav.roles.includes(user?.role) && (
                <NavLink
                  to={panchayatNav.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 ${isActive ? 'bg-bc-green-50' : ''}`
                  }
                >
                  <FaLandmark className="w-5 h-5" />
                  <span>{panchayatNav.label}</span>
                </NavLink>
              )}
              {nccrNav.roles.includes(user?.role) && (
                <NavLink
                  to={nccrNav.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 ${isActive ? 'bg-bc-green-50' : ''}`
                  }
                >
                  <FaShieldAlt className="w-5 h-5" />
                  <span>{nccrNav.label}</span>
                </NavLink>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <FaBars className="w-6 h-6" />
            </button>
            <div className="flex-1 md:flex-none">
              <h2 className="text-sm md:text-base font-medium text-gray-700">
                Ministry of Earth Sciences · National Centre for Coastal Research
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    STATUS_BADGE_CLASSES[user?.accountStatus] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[user?.accountStatus] || user?.accountStatus}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
