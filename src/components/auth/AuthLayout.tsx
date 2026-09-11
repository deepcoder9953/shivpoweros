import React from 'react';
import { Zap, ArrowLeft } from 'lucide-react';
import { Link } from '../../router/Router';
import { ThemeSelector } from '../ui/ThemeSelector';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeSelector variant="compact" />
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-6 sm:p-8 backdrop-blur-sm">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight block">
                  Shiv Power Solution
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  AI Business OS
                </span>
              </div>
            </Link>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Shiv Power Solution. All rights reserved.</p>
      </footer>
    </div>
  );
};
