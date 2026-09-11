import React from 'react';
import {
  Home,
  Users,
  Plus,
  CheckSquare,
  Sparkles,
  Menu,
} from 'lucide-react';
import { CRMTab } from '../crm/CRMNavigation';

export interface MobileNavCounts {
  openTasksCount?: number;
  leadsCount?: number;
}

interface MobileBottomNavProps {
  activeTab: CRMTab;
  onNavigateTab: (tab: CRMTab) => void;
  onOpenCreateSheet: () => void;
  onOpenMoreDrawer: () => void;
  counts?: MobileNavCounts;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenCreateSheet,
  onOpenMoreDrawer,
  counts: propCounts = {},
}) => {
  const counts: MobileNavCounts = propCounts;
  const isPrimary = (tab: CRMTab) => activeTab === tab;

  return (
    <div
      id="mobile-bottom-nav"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pb-[env(safe-area-inset-bottom,0.75rem)] pt-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <button
          id="mobile-nav-home"
          type="button"
          onClick={() => onNavigateTab('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isPrimary('overview')
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isPrimary('overview') ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Leads */}
        <button
          id="mobile-nav-leads"
          type="button"
          onClick={() => onNavigateTab('leads')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isPrimary('leads')
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className={`w-5 h-5 ${isPrimary('leads') ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Leads</span>
          {counts.leadsCount !== undefined && counts.leadsCount > 0 && (
            <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* 3. Center Prominent Add Button */}
        <div className="relative -top-2 flex flex-col items-center">
          <button
            id="mobile-nav-add-btn"
            type="button"
            onClick={onOpenCreateSheet}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Create New"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight">
            Add
          </span>
        </div>

        {/* 4. Tasks */}
        <button
          id="mobile-nav-tasks"
          type="button"
          onClick={() => onNavigateTab('tasks')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isPrimary('tasks')
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className={`w-5 h-5 ${isPrimary('tasks') ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Tasks</span>
          {counts.openTasksCount !== undefined && counts.openTasksCount > 0 && (
            <span className="absolute top-0.5 right-1.5 min-w-3.5 h-3.5 px-1 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {counts.openTasksCount > 9 ? '9+' : counts.openTasksCount}
            </span>
          )}
        </button>

        {/* 5. AI Copilot */}
        <button
          id="mobile-nav-ai"
          type="button"
          onClick={() => onNavigateTab('ai_assistant')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isPrimary('ai_assistant')
              ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isPrimary('ai_assistant') ? 'text-amber-500 fill-amber-500 stroke-[2]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">AI OS</span>
        </button>

        {/* 6. More Drawer */}
        <button
          id="mobile-nav-more"
          type="button"
          onClick={onOpenMoreDrawer}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </div>
    </div>
  );
};
