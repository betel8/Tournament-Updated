import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('');
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('player_token');
    setIsOpen(false);
    navigate('/');
  };

  const handleHomeClick = (e) => {
    if (user) {
      e.preventDefault();
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/player/dashboard';
      navigate(redirectPath);
    }
  };

  // Show loading state if auth is still initializing
  if (isLoading) {
    return (
      <nav className="bg-indigo-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img 
            src="/mainlogo.png" 
            alt="Tournament Logo" 
            className="h-8 md:h-10"
          />
          <div className="animate-pulse text-white font-semibold">Loading...</div>
        </div>
      </nav>
    );
  }

  // Links visible only to non-logged in users
  const guestLinks = [
    { path: '/rules', key: 'rules' },
    { path: '/matches', key: 'matches' },
    { path: '/login', key: 'login' },
    { path: '/register', key: 'register' }
  ];

  // Links visible only to logged in users
  const authLinks = [
    { 
      path: user?.role === 'admin' ? '/admin/dashboard' : '/player/dashboard', 
      key: 'dashboard' 
    },
    { path: '/matches', key: 'matches' },
    ...(user?.role === 'admin' ? [{ path: '/rules', key: 'rules' }] : []),
    {
      key: 'logout',
      onClick: handleLogout,
      label: t('navbar.logout')
    }
  ];

  // Combine links based on authentication status
  const navLinks = user ? authLinks : guestLinks;

  const isActive = (path) => {
    return activeLink === path || 
           (path !== '/' && activeLink.startsWith(path));
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Nav */}
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/player/dashboard') : '/'}
              onClick={handleHomeClick}
              className="flex items-center"
            >
              <img 
                src="/mainlogo.png" 
                alt="Tournament Logo" 
                className="h-8 md:h-10"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              link.path ? (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={link.onClick || (() => {})}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path) 
                      ? 'text-white bg-blue-900 shadow-md border border-blue-300' 
                      : 'text-white bg-blue-700/70 hover:bg-blue-600 border border-transparent'
                  }`}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {t(`navbar.${link.key}`)}
                </Link>
              ) : (
                <button
                  key={link.key}
                  onClick={link.onClick}
                  className="px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-700/70 hover:bg-blue-600 transition-all duration-200 border border-transparent"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {link.label}
                </button>
              )
            ))}

            {/* Language Switcher */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/40 hover:bg-white/40 transition-all ml-4 font-semibold"
              aria-label="Change language"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              <span className="text-sm">
                {i18n.language === 'en' ? 'English' : 'አማርኛ'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white focus:outline-none bg-blue-700/70 border border-blue-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-blue-800 border-t border-blue-600"
            >
              <div className="pt-2 pb-4 space-y-1">
                {navLinks.map((link) => (
                  link.path ? (
                    <Link
                      key={link.key}
                      to={link.path}
                      onClick={() => {
                        if (link.onClick) {
                          link.onClick();
                        }
                        setIsOpen(false);
                      }}
                      className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors mx-2 ${
                        isActive(link.path)
                          ? 'bg-blue-900 text-white border border-blue-400'
                          : 'text-white bg-blue-700/80 hover:bg-blue-600 border border-transparent'
                      }`}
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {t(`navbar.${link.key}`)}
                    </Link>
                  ) : (
                    <button
                      key={link.key}
                      onClick={() => {
                        link.onClick();
                        setIsOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold transition-colors text-white bg-blue-700/80 hover:bg-blue-600 mx-2 border border-transparent`}
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {link.label}
                    </button>
                  )
                ))}
                <div className="px-3 py-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      changeLanguage(i18n.language === 'en' ? 'am' : 'en');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/40 hover:bg-white/40 font-semibold"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    <span className="text-sm">
                      {i18n.language === 'en' ? 'English' : 'አማርኛ'}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx>{`
        .text-shadow {
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;