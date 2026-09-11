import React, { useState, useEffect } from 'react';
import { Zap, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Link, useRouter } from '../../router/Router';
import { useAuth } from '../../auth/AuthContext';
import { ThemeSelector } from '../ui/ThemeSelector';

export const LandingNavbar: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { navigate } = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight">
              Shiv Power Solution
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
              AI Business OS
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="px-3 py-1 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('features')}
            className="px-3 py-1 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="px-3 py-1 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('platform')}
            className="px-3 py-1 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="px-3 py-1 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Right: Actions & Theme (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeSelector variant="toggle" />

          {user ? (
            <button
              type="button"
              id="landing-open-dashboard-btn"
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="landing-nav-signin-btn"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                id="landing-nav-getstarted-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Theme */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSelector variant="toggle" />
          <button
            type="button"
            id="landing-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1 py-2">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('platform')}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              Business Architecture
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              About
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/app');
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
