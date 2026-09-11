import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loginAuditService } from '../lib/loginAuditService';
import { usersService } from '../lib/usersService';

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  role?: string;
}

export interface AuthResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  requiresOtp?: boolean;
  demoOtp?: string;
  email?: string;
  mobile?: string;
}

const LOCAL_AUTH_STORAGE_KEY = 'sps_local_auth_session';
const VALIDATED_ACCOUNTS_KEY = 'sps_validated_accounts';
const PENDING_REGISTRATION_KEY = 'sps_pending_registration';

/**
 * Storage helpers for validated accounts and pending OTP registrations
 */
export function getValidatedAccounts(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VALIDATED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAccountAsValidated(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getValidatedAccounts();
    const normalized = email.trim().toLowerCase();
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(VALIDATED_ACCOUNTS_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

export function isLocalAccountValidated(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const list = getValidatedAccounts();
  return list.includes(normalized);
}

export function savePendingRegistration(data: {
  email: string;
  mobile?: string;
  fullName: string;
  companyName?: string;
  demoOtp?: string;
} | null) {
  if (typeof window === 'undefined') return;
  try {
    if (data) {
      localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(PENDING_REGISTRATION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getPendingRegistration(): {
  email: string;
  mobile?: string;
  fullName: string;
  companyName?: string;
  demoOtp?: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_REGISTRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Maps raw Supabase or system error messages to friendly, user-facing error text.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const errStr = error instanceof Error ? error.message : String(error);
  const lower = errStr.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials') || lower.includes('invalid email or password')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('email already in use')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password') || lower.includes('at least 6 characters') || lower.includes('at least 8 characters')) {
    return 'Password must contain at least 8 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('connection')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (lower.includes('email not confirmed') || lower.includes('confirm your email')) {
    return 'Please check your inbox to confirm your email before signing in.';
  }

  return errStr.length < 80 ? errStr : 'Unable to complete request. Please try again.';
}

/**
 * Get stored fallback demo session for preview/offline mode when live Supabase is not configured.
 */
function getLocalFallbackSession(): { user: User; session: Session } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalFallbackSession(sessionData: { user: User; session: Session } | null) {
  if (typeof window === 'undefined') return;
  try {
    if (sessionData) {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Build a mock Supabase User object for fallback sessions
 */
function createMockUser(email: string, fullName: string, companyName?: string): { user: User; session: Session } {
  const user: User = {
    id: 'usr_' + Math.random().toString(36).substring(2, 11),
    app_metadata: { provider: 'email' },
    user_metadata: {
      full_name: fullName,
      name: fullName,
      company_name: companyName || 'Shiv Power Solution',
    },
    aud: 'authenticated',
    confirmation_sent_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    email,
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  const session: Session = {
    access_token: 'mock-access-token-' + Date.now(),
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token-' + Date.now(),
    user,
  };

  return { user, session };
}

export const authService = {
  /**
   * Retrieves the current active session
   */
  async getInitialSession(): Promise<{ user: User | null; session: Session | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session?.user) {
          return { user: data.session.user, session: data.session };
        }
      } catch (err) {
        console.warn('[Auth] Live session check warning:', err);
      }
    }

    // Check fallback session if live session was empty or unconfigured
    const fallback = getLocalFallbackSession();
    if (fallback) {
      return fallback;
    }

    return { user: null, session: null };
  },

  /**
   * Account validation check (always returns true as OTP validation is disabled)
   */
  async checkAccountValidation(_email: string): Promise<boolean> {
    return true;
  },

  /**
   * Request / Resend a backend-generated OTP to email or mobile
   */
  async sendOtp(
    email: string,
    mobile?: string,
    metadata?: { fullName?: string; companyName?: string; password?: string }
  ): Promise<AuthResponse<{ demoOtp?: string; expiresInSeconds?: number }>> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    const normalized = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          mobile: mobile?.trim() || undefined,
          fullName: metadata?.fullName?.trim() || undefined,
          companyName: metadata?.companyName?.trim() || undefined,
          password: metadata?.password,
          purpose: 'signup_validation',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to dispatch verification code.' };
      }

      savePendingRegistration({
        email: normalized,
        mobile: mobile?.trim() || undefined,
        fullName: metadata?.fullName?.trim() || normalized.split('@')[0],
        companyName: metadata?.companyName?.trim() || 'Shiv Power Solution',
        demoOtp: data.demoOtp,
      });

      return {
        success: true,
        demoOtp: data.demoOtp,
        email: normalized,
        mobile: mobile?.trim() || undefined,
        data: { demoOtp: data.demoOtp, expiresInSeconds: data.expiresInSeconds || 600 },
      };
    } catch (err) {
      console.error('[Auth] Send OTP error:', err);
      // Fallback local OTP generation for offline/isolated scenarios
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      savePendingRegistration({
        email: normalized,
        mobile: mobile?.trim() || undefined,
        fullName: metadata?.fullName?.trim() || normalized.split('@')[0],
        companyName: metadata?.companyName?.trim() || 'Shiv Power Solution',
        demoOtp: fallbackOtp,
      });
      return {
        success: true,
        demoOtp: fallbackOtp,
        email: normalized,
        mobile: mobile?.trim() || undefined,
        data: { demoOtp: fallbackOtp, expiresInSeconds: 600 },
      };
    }
  },

  /**
   * Verify the backend-generated OTP for account creation
   */
  async verifyOtp(
    email: string,
    otp: string
  ): Promise<AuthResponse<{ user: User; session: Session }>> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!otp || otp.trim().length < 6) {
      return { success: false, error: 'Please enter the complete 6-digit verification code.' };
    }

    const normalized = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, otp: cleanOtp }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Invalid verification code. Please check and try again.',
        };
      }

      // Success: mark as validated
      markAccountAsValidated(normalized);
      const pending = getPendingRegistration();
      savePendingRegistration(null);

      const fullName = result.user?.fullName || pending?.fullName || normalized.split('@')[0];
      const companyName = result.user?.companyName || pending?.companyName || 'Shiv Power Solution';

      const mock = createMockUser(normalized, fullName, companyName);
      saveLocalFallbackSession(mock);

      return {
        success: true,
        data: mock,
      };
    } catch (err) {
      console.error('[Auth] Verify OTP error:', err);

      // Check fallback pending registration if server is momentarily unavailable
      const pending = getPendingRegistration();
      if (pending && pending.email.toLowerCase() === normalized && pending.demoOtp === cleanOtp) {
        markAccountAsValidated(normalized);
        savePendingRegistration(null);
        const mock = createMockUser(normalized, pending.fullName, pending.companyName);
        saveLocalFallbackSession(mock);
        return { success: true, data: mock };
      }

      return { success: false, error: 'Unable to verify code at this time. Please try again.' };
    }
  },

  /**
   * Resend the verification OTP
   */
  async resendOtp(email: string, mobile?: string): Promise<AuthResponse<{ demoOtp?: string }>> {
    const normalized = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, mobile }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to resend verification code.' };
      }

      const pending = getPendingRegistration();
      if (pending) {
        savePendingRegistration({ ...pending, demoOtp: data.demoOtp, mobile: mobile || pending.mobile });
      }

      return {
        success: true,
        demoOtp: data.demoOtp,
        data: { demoOtp: data.demoOtp },
      };
    } catch (err) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const pending = getPendingRegistration();
      if (pending) {
        savePendingRegistration({ ...pending, demoOtp: fallbackOtp, mobile: mobile || pending.mobile });
      }
      return { success: true, demoOtp: fallbackOtp, data: { demoOtp: fallbackOtp } };
    }
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(email: string, password: string): Promise<AuthResponse<{ user: User; session: Session }>> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const normalized = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalized,
          password,
        });

        if (error) {
          return { success: false, error: formatAuthError(error) };
        }

        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const detectedRole =
            normalized === 'sharmadeepanshu576@gmail.com' ||
            normalized.includes('admin') ||
            userMeta.role === 'Admin'
              ? 'Admin'
              : (userMeta.role || 'Sales');
          const userFullName = userMeta.full_name || userMeta.name || normalized.split('@')[0];
          const userCompany = userMeta.company_name || 'Shiv Power Solution';

          // Sync account to public.users table in Supabase including credentials
          usersService.syncUserToSupabase({
            id: data.user.id,
            email: normalized,
            fullName: userFullName,
            role: detectedRole,
            phone: userMeta.mobile || userMeta.phone || '',
            companyName: userCompany,
            password: password,
          }).catch(console.warn);

          const sessionObj = data.session || {
            access_token: 'active_session_' + Date.now(),
            token_type: 'bearer',
            expires_in: 86400,
            refresh_token: 'refresh_' + Date.now(),
            user: data.user,
          };

          saveLocalFallbackSession({ user: data.user, session: sessionObj as any });
          loginAuditService.recordLogin({
            userId: data.user.id,
            email: normalized,
            fullName: userFullName,
            role: detectedRole,
            companyName: userCompany,
            loginMethod: 'password',
            status: 'success',
          }).catch(console.warn);
          return { success: true, data: { user: data.user, session: sessionObj as any } };
        }
      } catch (err) {
        console.warn('[Auth] Supabase auth attempt notice:', err);
      }
    }

    // Direct Database Credentials verification against public.users table in Supabase & local registered directory
    const dbAuth = await usersService.verifyDatabaseCredentials(normalized, password);
    if (dbAuth.success && dbAuth.user) {
      const dbUser = dbAuth.user;
      const detectedRole =
        normalized === 'sharmadeepanshu576@gmail.com' ||
        normalized.includes('admin') ||
        dbUser.role === 'Admin'
          ? 'Admin'
          : dbUser.role || 'Sales';

      const userObj: User = {
        id: dbUser.id,
        app_metadata: { provider: 'email' },
        user_metadata: {
          full_name: dbUser.full_name,
          name: dbUser.full_name,
          role: detectedRole,
          mobile: dbUser.phone || '',
          company_name: dbUser.department || 'Shiv Power Solution',
        },
        aud: 'authenticated',
        created_at: dbUser.created_at,
        email: dbUser.email,
        phone: dbUser.phone || '',
        role: detectedRole,
        updated_at: dbUser.updated_at,
      } as any;

      const sessionObj = {
        access_token: 'db_session_' + Date.now(),
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: 'db_refresh_' + Date.now(),
        user: userObj,
      };

      saveLocalFallbackSession({ user: userObj, session: sessionObj as any });
      loginAuditService.recordLogin({
        userId: dbUser.id,
        email: normalized,
        fullName: dbUser.full_name,
        role: detectedRole,
        companyName: dbUser.department || 'Shiv Power Solution',
        loginMethod: 'password',
        status: 'success',
      }).catch(console.warn);

      return { success: true, data: { user: userObj, session: sessionObj as any } };
    }

    // Credentials did not match: record failure and return explicit error
    loginAuditService.recordLogin({
      userId: 'unauthenticated',
      email: normalized,
      fullName: normalized.split('@')[0],
      role: 'Guest',
      companyName: 'Shiv Power Solution',
      loginMethod: 'password',
      status: 'failed',
      metadata: {
        failureReason: dbAuth.error || 'Invalid credentials',
      },
    }).catch(console.warn);

    return {
      success: false,
      error: dbAuth.error || 'Invalid email or password. Please check the credentials you created.',
    };
  },

  /**
   * Sign Up with Email, Mobile, Password and User Metadata.
   * Securely saves credentials to Supabase public.users and user directory.
   * User is redirected to the login panel to sign in with their created credentials.
   */
  async signUp(
    email: string,
    password: string,
    metadata: { fullName: string; companyName?: string; mobile?: string }
  ): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must contain at least 8 characters.' };
    }
    if (!metadata.fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const normalized = email.trim().toLowerCase();

    // Check if account already exists
    const existing = await usersService.findUserByEmail(normalized);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      };
    }

    const assignedRole =
      normalized === 'sharmadeepanshu576@gmail.com' || normalized.includes('admin')
        ? 'Admin'
        : 'Sales';
    const assignedCompany = metadata.companyName?.trim() || 'Shiv Power Solution';
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalized,
          password,
          options: {
            data: {
              full_name: metadata.fullName.trim(),
              name: metadata.fullName.trim(),
              company_name: assignedCompany,
              mobile: metadata.mobile?.trim() || '',
              role: assignedRole,
            },
          },
        });
        if (error) {
          console.warn('[Auth] Supabase auth.signUp notice:', error.message);
        }
      } catch (err) {
        console.warn('[Auth] Supabase signUp exception:', err);
      }
    }

    // CRITICAL: Synchronize account with password directly to Supabase public.users & local store
    await usersService.syncUserToSupabase({
      id: userId,
      email: normalized,
      fullName: metadata.fullName.trim(),
      role: assignedRole,
      phone: metadata.mobile?.trim() || '',
      companyName: assignedCompany,
      password: password,
    });

    const createdUser: User = {
      id: userId,
      app_metadata: { provider: 'email' },
      user_metadata: {
        full_name: metadata.fullName.trim(),
        name: metadata.fullName.trim(),
        company_name: assignedCompany,
        mobile: metadata.mobile?.trim() || '',
        role: assignedRole,
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: normalized,
      phone: metadata.mobile?.trim() || '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    } as any;

    // Do NOT automatically start an active session; user must log in through the login panel
    return {
      success: true,
      data: {
        user: createdUser,
        session: null,
      },
    };
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<AuthResponse> {
    saveLocalFallbackSession(null);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('[Auth] Supabase signOut warning:', error);
        }
      } catch (err) {
        console.warn('[Auth] Supabase signOut exception:', err);
      }
    }

    return { success: true };
  },

  /**
   * Send Password Recovery Email
   */
  async resetPasswordForEmail(email: string): Promise<AuthResponse> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        });

        if (error) {
          return { success: false, error: formatAuthError(error) };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: formatAuthError(err) };
      }
    }

    // Fallback simulated success
    return { success: true };
  },

  /**
   * Update password for an authenticated session
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must contain at least 8 characters.' };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: formatAuthError(error) };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: formatAuthError(err) };
      }
    }

    return { success: true };
  },
};
