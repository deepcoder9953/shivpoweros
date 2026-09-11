import React from 'react';
import { ShieldCheck, Cloud, Database, Sparkles, Smartphone, Check } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    description: 'Encrypted email authentication backed by Supabase with JWT authorization tokens.',
  },
  {
    icon: Cloud,
    title: 'Cloud-Based Workspace',
    description: 'Access your CRM and operations anytime, anywhere with cloud-native reliability.',
  },
  {
    icon: Database,
    title: 'Centralized Business Data',
    description: 'Eliminate fragmented spreadsheets with a single relational source of truth.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Integrated Google Gemini AI agents assist with summaries, draft proposals, and next actions.',
  },
  {
    icon: Smartphone,
    title: 'Responsive on Every Device',
    description: 'Designed mobile-first from 320px screens to ultra-wide multi-monitor desktops.',
  },
];

export const LandingSecurityTrust: React.FC = () => {
  return (
    <section
      id="about"
      className="py-20 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Trust & Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Your Business
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Reliable engineering designed for high-performing commercial, industrial, and electrical engineering firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col items-center text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {point.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
