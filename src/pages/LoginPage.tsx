import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useRouter, Link } from '../router/Router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, loading, signIn } = useAuth();
  const { navigate, searchParams } = useRouter();

  const isRegisteredParam =
    searchParams.get('registered') === '1' || searchParams.get('registered') === 'true';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(
    isRegisteredParam
      ? 'Account created successfully! Please enter the password you created to sign in.'
      : ''
  );

  // Update email if query param changes
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
    }
    if (isRegisteredParam) {
      setSuccessNotice('Account created successfully! Please enter the password you created to sign in.');
    }
  }, [emailParam, isRegisteredParam]);

  // If already authenticated, redirect to /app
  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await signIn(email.trim(), password);
      if (!res.success) {
        setErrorMessage(
          res.error || 'Invalid credentials. Please enter the same credentials created during sign in.'
        );
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err) {
      setErrorMessage('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with the credentials created during registration"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Registration Success Banner */}
        {successNotice && !errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-0.5">
              <p className="font-bold">Account Created</p>
              <p className="leading-relaxed opacity-90">{successNotice}</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-email"
            className="block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Password */}
        <PasswordInput
          id="login-password"
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage('');
          }}
          placeholder="Enter the password created in sign up"
        />

        {/* Forgot password link */}
        <div className="flex items-center justify-end text-xs">
          <Link
            href="/forgot-password"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Link to Register */}
        <div className="pt-3 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
          <span>Don't have an account yet? </span>
          <Link
            href="/register"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            Create Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
