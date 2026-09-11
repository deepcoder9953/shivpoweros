import React from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  CalendarClock,
  CheckSquare,
  History,
  Sparkles,
  FileText,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export type CRMTab =
  | 'overview'
  | 'leads'
  | 'pipeline'
  | 'customers'
  | 'quotations'
  | 'projects'
  | 'followups'
  | 'tasks'
  | 'activities'
  | 'ai_assistant'
  | 'user_logins';

interface CRMNavigationProps {
  activeTab: CRMTab;
  onTabChange: (tab: CRMTab) => void;
  counts?: {
    leads?: number;
    customers?: number;
    quotations?: number;
    projects?: number;
    followups?: number;
    tasks?: number;
  };
}

export const CRMNavigation: React.FC<CRMNavigationProps> = ({
  activeTab,
  onTabChange,
  counts = {
    leads: 0,
    customers: 0,
    quotations: 0,
    projects: 0,
    followups: 0,
    tasks: 0,
  },
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.isAdmin ?? false;

  const safeCounts = {
    leads: counts?.leads ?? 0,
    customers: counts?.customers ?? 0,
    quotations: counts?.quotations ?? 0,
    projects: counts?.projects ?? 0,
    followups: counts?.followups ?? 0,
    tasks: counts?.tasks ?? 0,
  };

  const navItems = [
    {
      id: 'overview' as CRMTab,
      label: 'CRM Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'leads' as CRMTab,
      label: 'Leads',
      icon: Users,
      badge: safeCounts.leads,
    },
    {
      id: 'pipeline' as CRMTab,
      label: 'Sales Pipeline',
      icon: Kanban,
      badge: null,
    },
    {
      id: 'customers' as CRMTab,
      label: 'Customers',
      icon: Building2,
      badge: safeCounts.customers,
    },
    {
      id: 'quotations' as CRMTab,
      label: 'Quotations',
      icon: FileText,
      badge: safeCounts.quotations,
    },
    {
      id: 'projects' as CRMTab,
      label: 'Projects',
      icon: FolderKanban,
      badge: safeCounts.projects,
    },
    {
      id: 'followups' as CRMTab,
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: safeCounts.followups,
    },
    {
      id: 'tasks' as CRMTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: safeCounts.tasks,
    },
    {
      id: 'activities' as CRMTab,
      label: 'Activities',
      icon: History,
      badge: null,
    },
    {
      id: 'ai_assistant' as CRMTab,
      label: 'AI Sales Assistant',
      icon: Sparkles,
      badge: 'Gemini',
    },
    ...(isAdmin
      ? [
          {
            id: 'user_logins' as CRMTab,
            label: 'User Logins',
            icon: ShieldCheck,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="CRM Sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`crm-tab-${item.id}`}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (typeof item.badge === 'string' || item.badge > 0) && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.id === 'ai_assistant'
                        ? isActive
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
