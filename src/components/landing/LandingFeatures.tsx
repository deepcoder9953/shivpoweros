import React from 'react';
import {
  UserPlus,
  Users,
  FileText,
  FolderKanban,
  Sparkles,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Link } from '../../router/Router';

const FEATURES = [
  {
    icon: UserPlus,
    title: 'Lead Management',
    description: 'Capture, organize and track every business lead from one place.',
    color: 'from-blue-600 to-cyan-600',
    tag: 'Pipeline Ingestion',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Maintain customer information and build a complete customer view.',
    color: 'from-indigo-600 to-blue-600',
    tag: '360° Profiles',
  },
  {
    icon: FileText,
    title: 'Quotations',
    description: 'Create and manage professional business quotations quickly.',
    color: 'from-amber-500 to-orange-600',
    tag: 'Commercial Proposals',
  },
  {
    icon: FolderKanban,
    title: 'Projects',
    description: 'Track projects, progress, tasks and deadlines.',
    color: 'from-emerald-500 to-teal-600',
    tag: 'Operational Delivery',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Use AI to understand your business data and make smarter decisions.',
    color: 'from-purple-600 to-indigo-600',
    tag: 'Gemini Copilot',
  },
  {
    icon: CheckSquare,
    title: 'Follow-ups & Tasks',
    description: 'Never miss an important follow-up, task or customer interaction.',
    color: 'from-rose-500 to-pink-600',
    tag: 'Action Schedules',
  },
];

export const LandingFeatures: React.FC = () => {
  return (
    <section
      id="features"
      className="py-20 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Core Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminate fragmented tools. Shiv Power Solution coordinates your entire commercial and operational lifecycle inside one streamlined OS.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <span>Explore module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
