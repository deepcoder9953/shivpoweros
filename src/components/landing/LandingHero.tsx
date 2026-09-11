import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, Users, FolderKanban, IndianRupee, Bot, Zap, CheckCircle2 } from 'lucide-react';
import { Link, useRouter } from '../../router/Router';
import { useAuth } from '../../auth/AuthContext';

export const LandingHero: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-amber-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-xs font-black tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>AI-POWERED BUSINESS MANAGEMENT</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Run Your Business. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                Smarter. Faster. Better.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Shiv Power Solution AI Business Operating System brings your leads, customers, projects, quotations, tasks and AI-powered business insights into one intelligent workspace.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              {user ? (
                <button
                  type="button"
                  id="hero-open-dashboard-cta"
                  onClick={() => navigate('/app')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link
                    href="/register"
                    id="hero-get-started-cta"
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/login"
                    id="hero-signin-cta"
                    className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-center"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Key Value Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Single unified workspace</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Gemini AI copilot built-in</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Direct Supabase credentials control</span>
              </span>
            </div>

            {/* Industrial Partners & Standards Strip */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Engineered for High-Capacity Power Infrastructure & OEMs
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  Cummins DG Sets
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  Kirloskar Electric
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  Schneider Electric
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  L&T Switchgears
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                  ISO 9001:2015 & CPRI
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Operations Visual with Photorealistic Imagery */}
          <div className="lg:col-span-5 relative">
            {/* Ambient decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-3xl blur-lg opacity-25 dark:opacity-40 animate-pulse pointer-events-none" />

            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
              {/* Top Banner with Real-Time Photographic Header */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                  alt="Industrial Power Systems Engineer on site"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

                {/* Floating Real-Time Status in Image */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE TELEMETRY
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/80 backdrop-blur-md text-[10px] font-bold text-white border border-blue-400/30">
                    Shiv Power Fleet
                  </span>
                </div>

                {/* Floating Metric on Image Bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div>
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">
                      Connected Grid Node
                    </span>
                    <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Faridabad Industrial Substation
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block font-bold">99.98% SLA</span>
                    <span className="text-[11px] text-slate-200">500 kVA DG Sync</span>
                  </div>
                </div>
              </div>

              {/* Inner Dashboard Window */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                        Business Overview
                      </h4>
                      <span className="text-[10px] text-slate-400">Shiv Power Operating System</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    Active • Supabase Live
                  </span>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="text-[11px] font-medium">Leads</span>
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">128</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      +14% this month
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="text-[11px] font-medium">Customers</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">64</div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Active accounts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="text-[11px] font-medium">Revenue</span>
                      <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">₹4.8L</div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Pipeline closed
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="text-[11px] font-medium">Projects</span>
                      <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">18</div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                      In execution
                    </span>
                  </div>
                </div>

                {/* AI Business Insight Card */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/80 dark:border-purple-800/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
                      <Bot className="w-4 h-4 text-purple-500" />
                      <span>Gemini AI Copilot Insight</span>
                    </div>
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded">
                      High Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    4 high-intent industrial leads flagged for immediate quotation dispatch today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
