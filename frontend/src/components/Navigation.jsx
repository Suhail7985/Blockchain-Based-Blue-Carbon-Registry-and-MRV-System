import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome, FiFileText, FiCheckCircle, FiUsers,
  FiUser, FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const { user, logout, isNCCR, isPanchayat, isUser } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navItems = [];

  if (isNCCR()) {
    navItems.push(
      { path: '/dashboard/admin', label: 'Dashboard', icon: FiHome },
      { path: '/verification', label: 'Verification', icon: FiCheckCircle },
      { path: '/users', label: 'Users', icon: FiUsers }
    );
  } else if (isPanchayat()) {
    navItems.push(
      { path: '/dashboard/panchayat', label: 'Dashboard', icon: FiHome },
      { path: '/verification', label: 'Pending Reviews', icon: FiCheckCircle }
    );
  } else {
    navItems.push(
      { path: '/dashboard/user', label: 'My Plantations', icon: FaTree },
      { path: '/submit', label: 'Submit Data', icon: FiFileText }
    );
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`glass sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-xl' : 'shadow-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-xl">🌍</span>
                  </div>
                  <h1 className="text-xl font-bold gradient-text hidden sm:block">
                    Blue Carbon Registry
                  </h1>
                </Link>
              </motion.div>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path.includes('dashboard'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="mr-2" size={18} />
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative user-menu-container">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </motion.button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 glass border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500 capitalize mt-1 flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        {user?.role} • {user?.organization}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FiUser className="mr-2" size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FiSettings className="mr-2" size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-1"
                    >
                      <FiLogOut className="mr-2" size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path.includes('dashboard'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMenu(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center w-full pl-4 pr-4 py-3 rounded-lg text-base font-medium transition-all ${isActive
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="mr-3" size={20} />
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
              <div className="pt-4 pb-3 border-t border-gray-200 mt-2">
                <div className="px-4 mb-3">
                  <div className="text-base font-semibold text-gray-800">{user?.name}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiUser className="mr-3" size={18} />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg mt-1"
                >
                  <FiLogOut className="mr-3" size={18} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

