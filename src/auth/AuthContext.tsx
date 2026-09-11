import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Zap } from 'lucide-react';
import { authService, AuthResponse } from './authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse<{ user: User; session: Session }>>;
  signUp: (
    email: string,
    password: string,
    metadata: { fullName: string; companyName?: string; mobile?: string }
  ) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResponse<{ user: User; session: Session }>>;
  resendOtp: (email: string, mobile?: string) => Promise<AuthResponse<{ demoOtp?: string }>>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  userProfile: {
    fullName: string;
    email: string;
    initials: string;
    companyName: string;
    role: string;
    isAdmin: boolean;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check session on startup
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const initial = await authService.getInitialSession();
        if (isMounted) {
          setUser(initial.user);
          setSession(initial.session);
        }
      } catch (err) {
        console.warn('[AuthContext] Session init error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to Supabase live auth events
    if (isSupabaseConfigured) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);
          }
        );

        return () => {
          isMounted = false;
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.warn('[AuthContext] Auth state change listener warning:', err);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authService.signIn(email, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
    }
    return res;
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { fullName: string; companyName?: string; mobile?: string }
    ) => {
      const res = await authService.signUp(email, password, metadata);
      // User must redirect to login panel and authenticate with their credentials
      if (res.success && res.data?.session && res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session);
      }
      return res;
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await authService.verifyOtp(email, otp);
    if (res.success && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
    }
    return res;
  }, []);

  const resendOtp = useCallback(async (email: string, mobile?: string) => {
    return await authService.resendOtp(email, mobile);
  }, []);

  const signOut = useCallback(async () => {
    const res = await authService.signOut();
    setUser(null);
    setSession(null);
    return res;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return await authService.resetPasswordForEmail(email);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    return await authService.updatePassword(password);
  }, []);

  // Compute profile values
  const userProfile = useMemo(() => {
    if (!user) {
      return {
        fullName: 'Shiv Power User',
        email: '',
        initials: 'SP',
        companyName: 'Shiv Power Solution',
        role: 'Viewer',
        isAdmin: false,
      };
    }

    const metadata = user.user_metadata || {};
    const email = (user.email || '').trim().toLowerCase();
    const fullName = metadata.full_name || metadata.name || email.split('@')[0] || 'User';
    const companyName = metadata.company_name || 'Shiv Power Solution';

    // Check admin permissions
    const rawRole = (metadata.role as string) || '';
    const isAdmin =
      rawRole.toLowerCase() === 'admin' ||
      email.includes('admin') ||
      email === 'sharmadeepanshu576@gmail.com';
    const role = isAdmin ? 'Admin' : (rawRole || 'Sales');

    // Build initials
    const parts = fullName.trim().split(/\s+/);
    let initials = 'SP';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0]) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }

    return {
      fullName,
      email,
      initials,
      companyName,
      role,
      isAdmin,
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      verifyOtp,
      resendOtp,
      signOut,
      resetPassword,
      updatePassword,
      userProfile,
    }),
    [
      user,
      session,
      loading,
      signIn,
      signUp,
      verifyOtp,
      resendOtp,
      signOut,
      resetPassword,
      updatePassword,
      userProfile,
    ]
  );

  // Professional startup loading state (Requirement 25)
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white select-none">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-2xl animate-pulse">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-1.5 mt-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Shiv Power Solution
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              AI Business Operating System
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
            <span>Verifying workspace session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
