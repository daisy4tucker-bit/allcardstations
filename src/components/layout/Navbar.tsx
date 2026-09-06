import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CreditCard, Menu, X, ShieldCheck, ArrowRight, User, LogOut, LayoutDashboard, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { ShareButton } from '../common/ShareButton';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'daisy4tucker@gmail.com';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gift Cards', path: '/gift-cards' },
    { name: 'Validate Card', path: '/validate' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    ...(isAdmin ? [{ name: 'Admin Console', path: '/admin' }] : []),
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md ${
          isScrolled
            ? 'border-b border-slate-200/80 dark:border-slate-800 shadow-xs'
            : 'border-b border-slate-100 dark:border-slate-800/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo / Wordmark */}
            <Link
              to="/"
              id="brand-logo"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#2563EB] rounded-xl p-1 -ml-1 transition-all"
            >
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-center p-1 group-hover:border-[#2563EB]/50 group-hover:shadow-md group-hover:shadow-blue-500/10 group-hover:scale-105 transition-all duration-300">
                <img src="/logo.svg" alt="AllCardStatus Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    All<span className="text-[#2563EB] dark:text-blue-400">Card</span>Status
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 ml-0.5 -mt-2 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-extrabold text-[#2563EB] dark:text-blue-400 uppercase tracking-widest leading-none">
                    Digital Marketplace
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav role="navigation" aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-[#2563EB] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Right Action Buttons + Theme Toggle */}
            <div className="hidden lg:flex items-center gap-2.5">
              <ShareButton
                id="desktop-share-btn"
                title="AllCardStatus – Digital Gift Card Marketplace & Instant Validation"
                description="Buy, send, and instantly validate digital gift cards with instant delivery and zero KYC."
                variant="icon"
                size="sm"
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              />
              <ThemeToggle id="desktop-theme-toggle" />
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" aria-hidden="true" />
              
              {isAuthenticated && user && (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin" id="nav-admin-console-btn">
                      <Button variant="secondary" size="sm" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#86A98D]" />} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">
                        Admin Suite
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    title="Sign Out"
                    className="text-slate-500 hover:text-rose-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Header Buttons (Share + Theme Toggle + Hamburger) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <ShareButton
                id="mobile-header-share-btn"
                title="AllCardStatus – Digital Gift Card Marketplace & Instant Validation"
                description="Buy, send, and instantly validate digital gift cards with instant delivery and zero KYC."
                variant="icon"
                size="sm"
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              />
              <ThemeToggle id="mobile-header-theme-toggle" />
              {isAuthenticated && isAdmin && (
                <Link to="/admin" className="hidden sm:inline-block">
                  <Button variant="secondary" size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs">
                    Admin
                  </Button>
                </Link>
              )}
              <button
                type="button"
                id="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={isMobileMenuOpen}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-100 dark:border-slate-800">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs flex items-center justify-center">
                    <img src="/logo.svg" alt="AllCardStatus Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 dark:text-white text-base leading-none">
                      All<span className="text-[#2563EB] dark:text-blue-400">Card</span>Status
                    </span>
                    <span className="text-[9px] font-extrabold text-[#2563EB] dark:text-blue-400 uppercase tracking-widest mt-0.5">
                      Marketplace
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav role="navigation" aria-label="Mobile Main Navigation" className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800 hover:text-[#1E293B] dark:hover:text-white'
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Drawer Bottom Actions & Theme Switch */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-[#F5F7FA] dark:bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
                <ThemeToggle id="mobile-drawer-theme-toggle" />
              </div>

              {isAuthenticated && user && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white font-bold flex items-center justify-center">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1E293B] dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="w-full block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold" leftIcon={<ShieldCheck className="w-4 h-4 text-[#86A98D]" />}>
                        Admin Suite
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#86A98D]" />
                <span>Encrypted & Verified Platform</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

