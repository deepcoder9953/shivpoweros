import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useRouter } from '../../router/Router';
import { ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Phone, Mail, Sparkles, Eye, Check } from 'lucide-react';

interface OtpVerificationCardProps {
  email: string;
  mobile?: string;
  demoOtp?: string;
  onBackToRegister?: () => void;
  onSuccess?: () => void;
}

export const OtpVerificationCard: React.FC<OtpVerificationCardProps> = ({
  email,
  mobile,
  demoOtp: initialDemoOtp,
  onBackToRegister,
  onSuccess,
}) => {
  const { verifyOtp, resendOtp } = useAuth();
  const { navigate } = useRouter();

  // 6 digits inputs
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [currentDemoOtp, setCurrentDemoOtp] = useState<string | undefined>(initialDemoOtp);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Auto-focus first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Handle typing single character or pasting
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // User pasted multiple numbers
      const newDigits = [...digits];
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (index + i < 6) {
          newDigits[index + i] = c;
        }
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto advance to next box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    const targetFocus = Math.min(pasteData.length, 5);
    inputRefs.current[targetFocus]?.focus();
  };

  const fullCode = digits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (fullCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await verifyOtp(email, fullCode);

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid verification code. Please check and try again.');
        // Clear digits for easy re-typing
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setSuccessMessage('Account validated successfully! Redirecting to your workspace...');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/app', { replace: true });
          }
        }, 800);
      }
    } catch (err) {
      setErrorMessage('Verification failed. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsResending(true);
      const res = await resendOtp(email, mobile);
      if (res.success) {
        setCooldown(60);
        if (res.demoOtp) {
          setCurrentDemoOtp(res.demoOtp);
        }
        setSuccessMessage('A fresh verification code has been generated and sent.');
      } else {
        setErrorMessage(res.error || 'Unable to resend code right now.');
      }
    } catch {
      setErrorMessage('Network error resending verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleUseDemoOtp = () => {
    if (!currentDemoOtp) return;
    const chars = currentDemoOtp.slice(0, 6).split('');
    setDigits(chars);
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Target Address Info Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-left">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-blue-950 dark:text-blue-200 text-xs font-bold">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>OTP Dispatched to Registered Email</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <Check className="w-2.5 h-2.5" /> Sent to Inbox
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
          Please check your email inbox for the 6-digit verification code sent to:
        </p>
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-blue-700 dark:text-blue-300 truncate">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailPreviewModal(true)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>View Email</span>
          </button>
        </div>
        {mobile && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>Mobile: <strong>{mobile}</strong></span>
          </div>
        )}
      </div>

      {/* Sandbox Demo Code Quick Fill Banner */}
      {currentDemoOtp && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Generated OTP: <strong className="font-mono tracking-wider font-black text-amber-700 dark:text-amber-300">{currentDemoOtp}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseDemoOtp}
            className="px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-100 bg-amber-200/70 hover:bg-amber-300/80 dark:bg-amber-900/60 dark:hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* 6-Digit OTP Inputs */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex justify-between gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 shadow-xs focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              aria-label={`Verification code digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Submit Verification Button */}
        <button
          type="submit"
          id="verify-otp-submit-btn"
          disabled={isVerifying || fullCode.length < 6}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Validating Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Activate Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend OTP & Back Options */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span>Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span className="font-semibold text-slate-400 dark:text-slate-500">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {onBackToRegister && (
          <button
            type="button"
            onClick={onBackToRegister}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ← Modify Registration Details
          </button>
        )}
      </div>

      {/* Dispatched Email Viewer Modal */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dispatched Email Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div><strong>To:</strong> {email}</div>
              <div><strong>Subject:</strong> Your Account Verification Code: {currentDemoOtp || '******'} - Shiv Power Solution</div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> Dispatched to User Mailbox
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs space-y-3">
              <div className="text-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold tracking-wide text-blue-600 dark:text-blue-400">⚡ SHIV POWER SOLUTION</span>
                <p className="text-[10px] text-slate-400 mt-0.5">B2B Enterprise CRM</p>
              </div>
              <p>Hello <strong>Valued User</strong>,</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Thank you for registering your account with Shiv Power Solution. To activate your account, please enter the following 6-digit verification code:
              </p>
              <div className="my-3 text-center">
                <div className="inline-block py-2.5 px-6 rounded-xl bg-blue-50 dark:bg-blue-950/60 border-2 border-dashed border-blue-500 font-mono text-2xl font-black tracking-widest text-blue-700 dark:text-blue-300">
                  {currentDemoOtp || digits.join('') || '123456'}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                This verification code expires in 10 minutes. If you did not register, please ignore this email.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  handleUseDemoOtp();
                  setShowEmailPreviewModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Copy & Fill Code ({currentDemoOtp || 'Auto-fill'})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
