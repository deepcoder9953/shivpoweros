import React, { useState } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  FileText,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Send,
} from 'lucide-react';
import { CRMTab } from '../crm/CRMNavigation';

interface FloatingAITriggerProps {
  onNavigateTab: (tab: CRMTab) => void;
  onOpenQuickPrompt?: (prompt: string) => void;
}

export const FloatingAITrigger: React.FC<FloatingAITriggerProps> = ({
  onNavigateTab,
  onOpenQuickPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      title: 'Analyze Pipeline & Leads',
      prompt: 'Analyze our current pipeline and tell me which deals are closest to closing and which need attention.',
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      title: 'Generate WhatsApp Message',
      prompt: 'Draft a professional Indian business WhatsApp follow-up for an industrial generator client.',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Improve Commercial Quotation',
      prompt: 'What are the best terms and payment milestones for industrial DG set supply and commissioning?',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      title: 'Suggest Next Best Action',
      prompt: 'Based on our overdue follow-ups and high score leads, what should be the top 3 priorities for today?',
      icon: BrainCircuit,
      color: 'text-purple-500 bg-purple-50 dark:purple-950/60',
    },
  ];

  const handleSelectPrompt = (prompt: string) => {
    setIsOpen(false);
    onNavigateTab('ai_assistant');
    if (onOpenQuickPrompt) {
      onOpenQuickPrompt(prompt);
    }
  };

  return (
    <div
      id="floating-ai-container"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 flex flex-col items-end"
    >
      {/* Quick Actions Card Menu */}
      {isOpen && (
        <div
          id="floating-ai-menu"
          className="mb-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  AI Business Copilot
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Shiv Power Intelligence
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Assistance
            </span>
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPrompt(action.prompt)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 hover:border-purple-200 dark:hover:border-purple-800/60 text-left transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                      {action.title}
                    </h5>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('ai_assistant');
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Open Full AI Copilot</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="floating-ai-fab-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
        <span className="hidden sm:inline">AI Copilot</span>
      </button>
    </div>
  );
};
