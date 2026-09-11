import React from 'react';
import { UserCheck, LayoutDashboard, BrainCircuit } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UserCheck,
    title: 'Create Your Account',
    description: 'Register securely using your email in seconds with Supabase authentication.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    step: '02',
    icon: LayoutDashboard,
    title: 'Manage Your Business',
    description: 'Access leads, customers, projects, quotations and tasks from one unified command center.',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    step: '03',
    icon: BrainCircuit,
    title: 'Work Smarter with AI',
    description: 'Get insights, predictive recommendations and automated action triggers from your live data.',
    color: 'from-amber-500 to-orange-600',
  },
];

export const LandingHowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Simple Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Get up and running with Shiv Power Solution in three frictionless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between"
              >
                {/* Step indicator badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800 select-none">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Step {idx + 1} of 3
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
