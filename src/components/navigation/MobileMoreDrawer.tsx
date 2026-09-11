import React from 'react';
import {
  X,
  Layers,
  Building2,
  FileText,
  FolderKanban,
  Calendar,
  Clock,
  Settings,
  Sparkles,
  Zap,
  Database,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { CRMTab } from '../crm/CRMNavigation';
import { ThemeSelector } from '../ui/ThemeSelector';
import { useAuth } from '../../auth/AuthContext';
import { useRouter } from '../../router/Router';
import { LogOut, User } from 'lucide-react';

export interface MobileDrawerCounts {
  customersCount?: number;
  quotationsCount?: number;
  projectsCount?: number;
  todayFollowupCount?: number;
}

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: CRMTab;
  onNavigateTab: (tab: CRMTab) => void;
  counts?: MobileDrawerCounts;
  isLiveDatabase: boolean;
  onRefreshData: () => void;
  isLoadingData: boolean;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  counts: propCounts = {},
  isLiveDatabase,
  onRefreshData,
  isLoadingData,
}) => {
  const counts: MobileDrawerCounts = propCounts;
  const { userProfile, signOut } = useAuth();
  const { navigate } = useRouter();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/');
  };

  const navItems = [
    {
      id: 'pipeline' as CRMTab,
      label: 'Sales Pipeline',
      description: 'Kanban board & deal progression',
      icon: Layers,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      id: 'customers' as CRMTab,
      label: 'Customer Accounts',
      description: 'Directory, history & Customer 360',
      icon: Building2,
      count: counts.customersCount,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      id: 'quotations' as CRMTab,
      label: 'Quotations & Pricing',
      description: 'Commercial quotes & PDF printing',
      icon: FileText,
      count: counts.quotationsCount,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
    },
    {
      id: 'projects' as CRMTab,
      label: 'Industrial Projects',
      description: 'Contracts, milestones & deliverables',
      icon: FolderKanban,
      count: counts.projectsCount,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      id: 'followups' as CRMTab,
      label: 'Follow-up Schedule',
      description: 'Calls, visits & reminders',
      icon: Calendar,
      count: counts.todayFollowupCount,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50',
    },
    {
      id: 'activities' as CRMTab,
      label: 'Activity Audit Log',
      description: 'Full chronological system timeline',
      icon: Clock,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
    },
    ...(userProfile.isAdmin
      ? [
          {
            id: 'user_logins' as CRMTab,
            label: 'Admin: User Logins',
            description: 'Supabase database user tracking & login audits',
            icon: ShieldCheck,
            color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
          },
        ]
      : []),
  ];

  return (
    <div
      id="mobile-more-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-2xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="mobile-more-drawer-panel"
        className="w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Shiv Power OS
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                More Modules &amp; Tools
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
            Operations &amp; Delivery
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Appearance Section */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <ThemeSelector variant="full" />
          </div>

          {/* User Account & Logout */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Account
            </span>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userProfile.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {userProfile.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {userProfile.companyName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Database / Sync Status */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              System Health
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {isLiveDatabase ? 'Supabase Connected' : 'Local Dev Active'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveDatabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isLoadingData}
                className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
                title="Sync database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-blue-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
