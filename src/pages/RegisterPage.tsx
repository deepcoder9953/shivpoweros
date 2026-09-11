import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useRouter, Link } from '../router/Router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Mail, User, Building2, ArrowRight, AlertCircle, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { user, loading, signUp } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to /app
  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await signUp(email.trim(), password, {
        fullName: fullName.trim(),
        companyName: companyName.trim() || undefined,
        mobile: mobile.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Unable to initiate account creation. Please try again.');
      } else {
        // Redirect user to the login panel to enter the credentials they just created
        navigate(
          `/login?registered=1&email=${encodeURIComponent(email.trim().toLowerCase())}`,
          { replace: true }
        );
      }
    } catch (err) {
      setErrorMessage('Unable to connect. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Start your intelligent business workspace with Shiv Power Solution"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="register-fullname"
            className="block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              id="register-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Deepanshu Sharma"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="register-email"
            className="block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="register-mobile"
            className="block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Mobile Number <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="register-mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Company Name (Optional) */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="register-company"
            className="block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Company Name <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              id="register-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Shiv Power Solution"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Password */}
        <PasswordInput
          id="register-password"
          label="Password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          helperText="Minimum 8 characters with letters and numbers"
        />

        {/* Confirm Password */}
        <PasswordInput
          id="register-confirm-password"
          label="Confirm Password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
        />

        {/* Submit Button */}
        <button
          type="submit"
          id="register-submit-btn"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Link to Login */}
        <div className="pt-3 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

