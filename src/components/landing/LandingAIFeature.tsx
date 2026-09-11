import React from 'react';
import { Bot, Sparkles, Flame, Clock, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '../../router/Router';

export const LandingAIFeature: React.FC = () => {
  return (
    <section className="py-20 overflow-hidden relative border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Background glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: AI Description */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/70 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Intelligent Business Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Your Business Has an AI Assistant
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Turn your business data into useful insights, recommendations and next actions with an AI-powered business assistant.
            </p>

            <div className="space-y-3 pt-2 text-left max-w-lg mx-auto lg:mx-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Analyzes lead status, conversion friction, and high-priority deals instantly</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Drafts commercial follow-ups and quotations directly tailored to client requirements</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Delivers proactive daily briefings so no revenue opportunity is missed</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group"
              >
                <span>Experience the Shiv Power AI Copilot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual AI Briefing Cards */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-gradient-to-tr from-purple-500/15 via-indigo-500/10 to-blue-500/15 p-1 sm:p-2 border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-900/5 overflow-hidden">
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {/* Real-world high-tech command center visual */}
                <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
                    alt="AI Powered Decision Center"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-900/80 backdrop-blur-md text-[10px] font-bold text-purple-200 border border-purple-500/30">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                      Gemini 2.5 Flash Engine Active
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      Live Telemetry Sync
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          AI BUSINESS BRIEFING
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Real-time synthetic analysis
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      Ready
                    </span>
                  </div>

                {/* Example Insight Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 transition-all hover:translate-x-1">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        4 hot leads need attention today.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        High buying intent detected based on recent inquiry responses.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 transition-all hover:translate-x-1">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        3 follow-ups are overdue.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Scheduled check-ins with key manufacturing accounts require completion.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 transition-all hover:translate-x-1">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        2 quotations are awaiting response.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        High value proposals sent 3 days ago; suggested action: dispatch discount reminder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};
