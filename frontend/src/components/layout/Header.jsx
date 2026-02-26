import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaBars, 
  FaTimes, 
  FaSun, 
  FaMoon,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.relative')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    // Toggle dark class on html element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Government Bar */}
      <div className="bg-gov-blue-900 dark:bg-gray-900 text-white py-2 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Logo/Emblem */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-gov-blue-900 font-bold text-lg">🌊</span>
              </div>
              <span className="font-semibold">Ministry of Earth Sciences (MoES)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 hover:bg-gov-blue-800 rounded focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        className={`bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${
          isSticky ? 'sticky top-0 z-50 shadow-lg' : 'relative'
        }`}
        role="banner"
      >
        <nav className="container mx-auto px-4" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-carbon-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gov-blue-900 dark:text-white">Blue Carbon</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 block">Registry & MRV System</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center gap-1" role="menubar">
              {navItems.map((item) => (
                <li key={item.label} role="none">
                  <a
                    href={item.href}
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-gov-blue-600 dark:hover:text-carbon-blue-400 hover:bg-gov-blue-50 dark:hover:bg-gray-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Auth Buttons - Desktop */}
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-4 py-2 text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    >
                      <FaUser className="w-4 h-4" />
                      <span>{user.name}</span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/portal');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaUser className="w-4 h-4" />
                          User Portal
                        </button>
                        <button
                          onClick={async () => {
                            await logout();
                            navigate('/');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-gov-blue-600 text-white hover:bg-gov-blue-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 text-gray-700 hover:text-gov-blue-600 hover:bg-gov-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="py-4 space-y-1" role="menu">
              {navItems.map((item) => (
                <li key={item.label} role="none">
                  <a
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-gov-blue-600 dark:hover:text-carbon-blue-400 hover:bg-gov-blue-50 dark:hover:bg-gray-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-200 dark:border-gray-700" role="none">
                {isAuthenticated && user ? (
                  <div className="px-4 space-y-2">
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="block w-full px-4 py-2 text-center bg-red-600 text-white hover:bg-red-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-4 space-y-2">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/login');
                      }}
                      className="block w-full px-4 py-2 text-center text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/signup');
                      }}
                      className="block w-full px-4 py-2 text-center bg-gov-blue-600 text-white hover:bg-gov-blue-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    >
                      Register
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
