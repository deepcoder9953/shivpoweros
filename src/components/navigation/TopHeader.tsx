import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Zap,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ThemeSelector } from '../ui/ThemeSelector';
import { UserProfileDropdown } from '../auth/UserProfileDropdown';
import { CRMTab } from '../crm/CRMNavigation';
import { TopSearchBar } from './TopSearchBar';
import { Lead } from '../../types/lead';
import { Customer } from '../../types/customer';
import { Quotation } from '../../types/quotation';
import { Project } from '../../types/project';
import { Task } from '../../types/task';

interface TopHeaderProps {
  onOpenMobileDrawer: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenCreateSheet: () => void;
  onNavigateTab: (tab: CRMTab) => void;
  unreadNotificationsCount: number;
  isLiveDatabase: boolean;
  onRefreshData: () => void;
  isLoadingData: boolean;
  activeTabTitle: string;
  leads?: Lead[];
  customers?: Customer[];
  quotations?: Quotation[];
  projects?: Project[];
  tasks?: Task[];
  onSelectLead?: (lead: Lead) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectQuotation?: (quotation: Quotation) => void;
  onSelectProject?: (project: Project) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileDrawer,
  onOpenSearch,
  onOpenNotifications,
  onNavigateTab,
  unreadNotificationsCount,
  isLiveDatabase,
  onRefreshData,
  isLoadingData,
  activeTabTitle,
  leads,
  customers,
  quotations,
  projects,
  tasks,
  onSelectLead,
  onSelectCustomer,
  onSelectQuotation,
  onSelectProject,
}) => {
  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors"
    >
      {/* Left: Mobile Drawer Button & Logo / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight block truncate">
              Shiv Power
            </span>
          </div>
        </div>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {activeTabTitle}
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Shiv Power Solution B2B OS
          </span>
        </div>
      </div>

      {/* Middle: Live Global Search Input (Desktop) - Expanded width */}
      <div className="flex-1 max-w-xl lg:max-w-2xl hidden sm:block">
        <TopSearchBar
          onOpenFullModal={onOpenSearch}
          onNavigateTab={onNavigateTab}
          leads={leads}
          customers={customers}
          quotations={quotations}
          projects={projects}
          tasks={tasks}
          onSelectLead={onSelectLead}
          onSelectCustomer={onSelectCustomer}
          onSelectQuotation={onSelectQuotation}
          onSelectProject={onSelectProject}
        />
      </div>

      {/* Right: Search (Mobile Icon), Notifications, Theme, Sync */}
      <div className="flex items-center gap-2">
        {/* Search button on small mobile */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="sm:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* AI Quick Button */}
        <button
          type="button"
          onClick={() => onNavigateTab('ai_assistant')}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 rounded-xl transition-colors"
          title="Open AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Bell with unread badge */}
        <button
          id="top-notifications-btn"
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="View notifications and action items"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Compact Mode Change Toggle Button - frees up search bar space */}
        <ThemeSelector variant="toggle" />

        {/* Refresh Data button on desktop header */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isLoadingData}
          className="hidden md:inline-flex p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh CRM data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* User Account Profile with Dropdown */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
        <UserProfileDropdown />
      </div>
    </header>
  );
};
