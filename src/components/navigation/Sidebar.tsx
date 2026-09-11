import React, { useState } from 'react';
import {
  Home,
  Users,
  Layers,
  Building2,
  FileText,
  FolderKanban,
  CheckSquare,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Database,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { CRMTab } from '../crm/CRMNavigation';
import { ThemeSelector } from '../ui/ThemeSelector';
import { useAuth } from '../../auth/AuthContext';

export interface SidebarNavCounts {
  leadsCount?: number;
  customersCount?: number;
  quotationsCount?: number;
  projectsCount?: number;
  openTasksCount?: number;
  todayFollowupCount?: number;
}

interface SidebarProps {
  activeTab: CRMTab;
  onNavigateTab: (tab: CRMTab) => void;
  onOpenCreateSheet: () => void;
  counts?: SidebarNavCounts;
  isLiveDatabase: boolean;
  onRefreshData: () => void;
  isLoadingData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigateTab,
  onOpenCreateSheet,
  counts: propCounts = {},
  isLiveDatabase,
  onRefreshData,
  isLoadingData,
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.isAdmin ?? false;
  const counts: SidebarNavCounts = propCounts;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainNav = [
    { id: 'overview' as CRMTab, label: 'Dashboard', icon: Home },
    { id: 'leads' as CRMTab, label: 'Leads', icon: Users, count: counts.leadsCount },
    { id: 'pipeline' as CRMTab, label: 'Pipeline', icon: Layers },
    { id: 'customers' as CRMTab, label: 'Customers', icon: Building2, count: counts.customersCount },
  ];

  const opsNav = [
    { id: 'quotations' as CRMTab, label: 'Quotations', icon: FileText, count: counts.quotationsCount },
    { id: 'projects' as CRMTab, label: 'Projects', icon: FolderKanban, count: counts.projectsCount },
    { id: 'tasks' as CRMTab, label: 'Tasks', icon: CheckSquare, count: counts.openTasksCount },
    { id: 'followups' as CRMTab, label: 'Follow-ups', icon: Calendar, count: counts.todayFollowupCount },
    { id: 'activities' as CRMTab, label: 'Activity Log', icon: Clock },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                Shiv Power
              </h1>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
                AI Business OS
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Create Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenCreateSheet}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Create New Record"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {!isCollapsed && <span>Quick Create</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
              Core CRM
            </span>
          )}
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  type="button"
                  onClick={() => onNavigateTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commercial & Operations */}
        <div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
              Operations
            </span>
          )}
          <div className="space-y-1">
            {opsNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  type="button"
                  onClick={() => onNavigateTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Intelligence */}
        <div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
              Intelligence
            </span>
          )}
          <button
            id="sidebar-link-ai"
            type="button"
            onClick={() => onNavigateTab('ai_assistant')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai_assistant'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
            title="AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">AI Copilot</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-white/20 font-extrabold">
                  Gemini
                </span>
              </>
            )}
          </button>
        </div>

        {/* Administration & Security - ONLY FOR ADMIN */}
        {isAdmin && (
          <div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
                Admin & Security
              </span>
            )}
            <button
              id="sidebar-link-user-logins"
              type="button"
              onClick={() => onNavigateTab('user_logins')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                activeTab === 'user_logins'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
              title="User Logins & Database Audit"
            >
              <ShieldCheck
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'user_logins'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">User Logins</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Supabase
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer / Database & Theme & Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <ThemeSelector variant="compact" />
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isLoadingData}
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        )}

        {/* Database Status indicator */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border ${
            isLiveDatabase
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50'
          }`}
          title={isLiveDatabase ? 'Supabase Live Connected' : 'Local Dev State Active'}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && (
            <span className="truncate flex-1">
              {isLiveDatabase ? 'Supabase Live' : 'Local Dev State'}
            </span>
          )}
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLiveDatabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
