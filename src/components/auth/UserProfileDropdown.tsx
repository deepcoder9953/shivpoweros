import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useRouter } from '../../router/Router';
import { User, LogOut, Settings, ExternalLink, ShieldCheck, Building2, Mail } from 'lucide-react';

export const UserProfileDropdown: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowProfileModal(false);
      }
    };

    if (isOpen || showProfileModal) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showProfileModal]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setIsOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-expanded={isOpen}
          aria-label="User profile and account settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900 shrink-0">
            {userProfile.initials}
          </div>

          <div className="hidden lg:block text-left min-w-0 max-w-[120px]">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {userProfile.fullName}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {userProfile.companyName || 'SPS OS'}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {userProfile.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {userProfile.fullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userProfile.email || user?.email || 'Authenticated User'}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{userProfile.companyName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Public Home Page</span>
              </button>
            </div>

            {/* Logout */}
            <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{isLoggingOut ? 'Signing out...' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  User Account Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {userProfile.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {userProfile.email || user?.email || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Company</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {userProfile.companyName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Auth Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Authenticated
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
