import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaTachometerAlt,
  FaUser,
  FaMapMarkedAlt,
  FaSeedling,
  FaCoins,
  FaLink,
  FaFileInvoice,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaLock,
  FaLandmark,
  FaShieldAlt,
  FaHistory,
  FaGlobeAmericas,
  FaHeartbeat,
  FaBrain,
  FaStore,
  FaHome,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { useTranslation, languages } from '../../contexts/LanguageContext';

const navItems = [
  { path: '/', icon: FaHome, label: 'Home Page' },
  { path: '/portal', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/portal/profile', icon: FaUser, label: 'Account & Profile' },
  { path: '/portal/land', icon: FaMapMarkedAlt, label: 'Land Registration' },
  { path: '/portal/plantation', icon: FaSeedling, label: 'Plantation Submission' },
  { path: '/portal/my-plantations', icon: FaHistory, label: 'My Plantations & Status' },
  { path: '/portal/impact', icon: FaGlobeAmericas, label: 'National Impact' },
  { path: '/portal/gis', icon: FaMapMarkedAlt, label: 'GIS Monitoring' },
  { path: '/portal/health', icon: FaHeartbeat, label: 'Health Monitoring' },
  { path: '/portal/carbon', icon: FaCoins, label: 'Carbon Credits' },
  { path: '/portal/blockchain', icon: FaLink, label: 'Blockchain Records' },
  { path: '/portal/ledger', icon: FaFileInvoice, label: 'Carbon Ledger' },
];

const panchayatNav = { path: '/portal/panchayat', icon: FaLandmark, label: 'Panchayat Verification', roles: ['panchayat'] };
const nccrNav = { path: '/portal/nccr', icon: FaShieldAlt, label: 'NCCR Approval', roles: ['admin', 'verifier'] };
const nccrIntelligence = { path: '/portal/analysis/advanced', icon: FaBrain, label: 'Intelligence Lab', roles: ['admin', 'verifier'] };
const marketplaceNav = { path: '/portal/marketplace', icon: FaStore, label: 'CSR Marketplace', roles: ['admin', 'verifier', 'ngo', 'corporate'] };

const restrictedPaths = ['/portal/land', '/portal/carbon', '/portal/blockchain'];

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  const getTranslatedLabel = (label) => {
    const key = label.toLowerCase().replace(/ & /g, '').replace(/ /g, '');
    const keyMap = {
      'homepage': 'home',
      'dashboard': 'dashboard',
      'accountprofile': 'profile',
      'landregistration': 'landRegistration',
      'plantationsubmission': 'plantationSubmission',
      'myplantationsstatus': 'myPlantations',
      'nationalimpact': 'nationalImpact',
      'gismonitoring': 'gisMonitoring',
      'healthmonitoring': 'healthMonitoring',
      'carboncredits': 'credits',
      'blockchainrecords': 'blockchain',
      'notifications': 'notifications',
      'panchayatverification': 'panchayatVerification',
      'nccrapproval': 'nccrApproval',
      'intelligencelab': 'intelligenceLab',
      'csrmarketplace': 'marketplace'
    };
    const translatedKey = keyMap[key] || key;
    return t(translatedKey);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isRestricted = (path) => restrictedPaths.includes(path) && !isActive;

  const hideForRole = (path) => {
    if (!user) return false;
    if (user.role === 'panchayat') {
      return path === '/portal/plantation' || path === '/portal/carbon';
    }
    if (user.role === 'ngo') {
      return (
        path === '/portal/land' ||
        path === '/portal/plantation' ||
        path === '/portal/my-plantations' ||
        path === '/portal/carbon' ||
        path === '/portal/blockchain'
      );
    }
    if (user.role === 'admin' || user.role === 'verifier') {
      return path === '/portal/plantation' || path === '/portal/my-plantations' || path === '/portal/carbon';
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] fixed h-full z-40">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-bc-green-600 rounded flex items-center justify-center group-hover:bg-bc-green-700 transition-colors">
              <span className="text-white text-2xl">🌊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-bc-green-600 transition-colors">CarbonSetu</h1>
              <p className="text-xs text-gray-500">MoES / NCCR</p>
            </div>
          </Link>
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
                <span>{getTranslatedLabel(item.label)}</span>
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
              <span>{getTranslatedLabel(panchayatNav.label)}</span>
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
              <span>{getTranslatedLabel(nccrNav.label)}</span>
            </NavLink>
          )}
          {nccrIntelligence.roles.includes(user?.role) && (
            <NavLink
              to={nccrIntelligence.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-700 font-medium border-l-4 border-purple-500' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaBrain className="w-5 h-5 shrink-0" />
              <span>{getTranslatedLabel(nccrIntelligence.label)}</span>
            </NavLink>
          )}
          {marketplaceNav.roles.includes(user?.role) && (
            <NavLink
              to={marketplaceNav.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <FaStore className="w-5 h-5 shrink-0" />
              <span>{getTranslatedLabel(marketplaceNav.label)}</span>
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
                    <span>{getTranslatedLabel(item.label)}</span>
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
                  <span>{getTranslatedLabel(panchayatNav.label)}</span>
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
                  <span>{getTranslatedLabel(nccrNav.label)}</span>
                </NavLink>
              )}
              {nccrIntelligence.roles.includes(user?.role) && (
                <NavLink
                  to={nccrIntelligence.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 ${isActive ? 'bg-purple-50 text-purple-700' : ''}`
                  }
                >
                  <FaBrain className="w-5 h-5" />
                  <span>{getTranslatedLabel(nccrIntelligence.label)}</span>
                </NavLink>
              )}
              {marketplaceNav.roles.includes(user?.role) && (
                <NavLink
                  to={marketplaceNav.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`
                  }
                >
                  <FaStore className="w-5 h-5" />
                  <span>{getTranslatedLabel(marketplaceNav.label)}</span>
                </NavLink>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-30 flex items-center justify-between p-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">🌊</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">BC Registry</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              {getTranslatedLabel(navItems.find(i => i.path === location.pathname)?.label || 
               (location.pathname.includes('panchayat') ? 'Panchayat Verification' : '') ||
               (location.pathname.includes('nccr') ? 'NCCR Approval' : '') || 
               (location.pathname.includes('marketplace') ? 'CSR Marketplace' : '') ||
               'Dashboard')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-bc-green-500"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <div className="text-right ml-2 hidden sm:block">
               <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
               <p className="text-xs text-gray-500 font-medium">{user?.role === 'admin' ? t('intelligenceLab') : user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-teal-100 border border-green-200 flex items-center justify-center text-green-700 font-bold shadow-sm">
               {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <FaSignOutAlt className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
