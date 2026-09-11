import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from '../../router/Router';

export const LandingFooter: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white block">
                Shiv Power Solution
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                AI Business Operating System
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <Link
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-blue-600 dark:text-blue-400"
            >
              Register
            </Link>
          </nav>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Shiv Power Solution. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
