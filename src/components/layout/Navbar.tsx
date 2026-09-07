import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Menu, X, ShieldCheck, ArrowRight, User, LogOut, LayoutDashboard, Database, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { GIFT_CARDS } from '../../data/brands';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and search modal on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu or search modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut: ESC to close search, Ctrl/Cmd + K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/gift-cards?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsSearchOpen(false);
      navigate('/gift-cards');
    }
  };

  const filteredSearchResults = searchQuery.trim()
    ? GIFT_CARDS.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : GIFT_CARDS.slice(0, 6);

  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'daisy4tucker@gmail.com';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gift Cards', path: '/gift-cards' },
    { name: 'Check Card Status', path: '/validate' },
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
              <button
                type="button"
                id="desktop-search-nav-btn"
                onClick={() => setIsSearchOpen(true)}
                title="Search Gift Cards (Ctrl+K)"
                aria-label="Search Gift Cards"
                className="p-2 rounded-xl text-slate-500 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
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

            {/* Mobile Header Buttons (Search + Theme Toggle + Hamburger) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                id="mobile-header-search-btn"
                onClick={() => setIsSearchOpen(true)}
                title="Search Gift Cards"
                aria-label="Search Gift Cards"
                className="p-2 rounded-xl text-slate-500 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
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

      {/* Quick Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />

          {/* Search Box Modal */}
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50+ gift cards (e.g. Apple, Steam, Amazon)..."
                className="w-full py-4 pl-3 pr-8 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  ESC
                </span>
              )}
            </form>

            {/* Popular Brand Chips */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] shrink-0 mr-1">Popular:</span>
                {[
                  { name: 'Apple', slug: 'apple' },
                  { name: 'Steam', slug: 'steam' },
                  { name: 'Amazon', slug: 'amazon' },
                  { name: 'PlayStation', slug: 'playstation' },
                  { name: 'Xbox', slug: 'xbox' },
                  { name: 'Target', slug: 'target' },
                  { name: 'Netflix', slug: 'netflix' },
                ].map((brand) => (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/gift-cards/${brand.slug}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                {searchQuery ? `Matching Results (${filteredSearchResults.length})` : 'Featured Cards'}
              </div>
              <div className="space-y-1">
                {filteredSearchResults.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/gift-cards/${card.slug}`);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 p-1">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {card.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {card.category} • Instant eDelivery
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        From ${card.startingPrice}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {searchQuery ? `Searching for "${searchQuery}"` : 'Browse 50+ supported brands'}
              </span>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View all gift cards →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

