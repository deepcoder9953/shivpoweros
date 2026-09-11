import React from 'react';
import {
  Sparkles,
  UserPlus,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  Clock,
  LineChart,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

export const LandingBOSArchitecture: React.FC = () => {
  return (
    <section
      id="platform"
      className="py-20 border-b border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            System Topology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            One Workspace. Your Entire Business.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every department communicates with a shared state machine, orchestrating commercial, engineering, and follow-up activities without data silos.
          </p>
        </div>

        {/* Pure HTML/CSS Architecture Diagram */}
        <div className="max-w-4xl mx-auto bg-slate-50/70 dark:bg-slate-900/50 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800/80 shadow-sm">
          {/* Top Node: AI Assistant */}
          <div className="flex flex-col items-center">
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>AI ASSISTANT (Gemini Copilot)</span>
            </div>

            {/* Connecting line down */}
            <div className="w-0.5 h-8 bg-purple-400 dark:bg-purple-600 my-1 flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 translate-y-2" />
            </div>
          </div>

          {/* Middle Row 1: Core Lifecycle: LEADS -> CUSTOMERS -> PROJECTS */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Leads */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    LEADS
                  </div>
                  <div className="text-[10px] text-slate-500">Inbound & Prospecting</div>
                </div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>

            {/* Customers */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    CUSTOMERS
                  </div>
                  <div className="text-[10px] text-slate-500">Converted Accounts</div>
                </div>
              </div>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>

            {/* Projects */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  PROJECTS
                </div>
                <div className="text-[10px] text-slate-500">Delivery & Execution</div>
              </div>
            </div>
          </div>

          {/* Middle Row 2: Operational Sub-modules: TASKS, QUOTATIONS, FOLLOW-UPS */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tasks */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  TASKS
                </div>
                <div className="text-[10px] text-slate-500">Team Deliverables</div>
              </div>
            </div>

            {/* Quotations */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  QUOTATIONS
                </div>
                <div className="text-[10px] text-slate-500">Commercial Proposals</div>
              </div>
            </div>

            {/* Follow-ups */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  FOLLOW-UPS
                </div>
                <div className="text-[10px] text-slate-500">Schedules & Reminders</div>
              </div>
            </div>
          </div>

          {/* Bottom Node: Business Insights */}
          <div className="mt-8 flex flex-col items-center">
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 mb-2" />
            <div className="px-7 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs sm:text-sm shadow-md flex items-center gap-2.5">
              <LineChart className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>BUSINESS INSIGHTS & EXECUTIVE INTELLIGENCE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
