import React, { useState, useEffect } from 'react';
import { 
  FaBars, 
  FaTimes, 
  FaSearch, 
  FaGlobe, 
  FaSun, 
  FaMoon,
  FaPlus,
  FaMinus
} from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.fontSize = '110%';
    } else if (fontSize === 'small') {
      root.style.fontSize = '90%';
    } else {
      root.style.fontSize = '100%';
    }
  }, [fontSize]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Schemes', href: '#schemes' },
    { label: 'Notifications', href: '#notifications' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Government Bar */}
      <div className="bg-gov-blue-900 text-white py-2 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Logo/Emblem */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-gov-blue-900 font-bold text-lg">🇮🇳</span>
              </div>
              <span className="font-semibold">Government of [Country/State]</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Accessibility Options */}
            <div className="flex items-center gap-2" role="toolbar" aria-label="Accessibility options">
              <span className="sr-only">Font size:</span>
              <button
                onClick={() => setFontSize(fontSize === 'small' ? 'normal' : 'small')}
                className="p-1 hover:bg-gov-blue-800 rounded focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="text-xs">A</span>
              <button
                onClick={() => setFontSize(fontSize === 'large' ? 'normal' : 'large')}
                className="p-1 hover:bg-gov-blue-800 rounded focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Increase font size"
                title="Increase font size"
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 hover:bg-gov-blue-800 rounded focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <label htmlFor="language-select" className="sr-only">Select language</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gov-blue-800 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Language selector"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header
        className={`bg-white shadow-md transition-all duration-300 ${
          isSticky ? 'sticky top-0 z-50 shadow-lg' : 'relative'
        }`}
        role="banner"
      >
        <nav className="container mx-auto px-4" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gov-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-xl font-bold text-gov-blue-900">Portal</span>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center gap-1" role="menubar">
              {navItems.map((item) => (
                <li key={item.label} role="none">
                  <a
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                className="p-2 text-gray-700 hover:text-gov-blue-600 hover:bg-gov-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                aria-label="Search"
                title="Search"
              >
                <FaSearch className="w-5 h-5" />
              </button>

              {/* Auth Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <a
                  href="#login"
                  className="px-4 py-2 text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                  role="button"
                >
                  Sign In
                </a>
                <a
                  href="#register"
                  className="px-4 py-2 bg-gov-blue-600 text-white hover:bg-gov-blue-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                  role="button"
                >
                  Register
                </a>
              </div>

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
                    className="block px-4 py-2 text-gray-700 hover:text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-200" role="none">
                <div className="px-4 space-y-2">
                  <a
                    href="#login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center text-gov-blue-600 hover:bg-gov-blue-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    Sign In
                  </a>
                  <a
                    href="#register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center bg-gov-blue-600 text-white hover:bg-gov-blue-700 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                    role="menuitem"
                  >
                    Register
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
