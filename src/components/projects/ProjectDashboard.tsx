import React from 'react';
import { Project, formatProjectBudget, isProjectOverdue } from '../../types/project';
import {
  FolderKanban,
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Plus,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface ProjectDashboardProps {
  projects: Project[];
  onCreateProject: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onCreateProject,
}) => {
  // Counts by status
  const totalProjects = projects.length;
  const planningCount = projects.filter((p) => p.status === 'planning').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const onHoldCount = projects.filter((p) => p.status === 'on_hold').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const cancelledCount = projects.filter((p) => p.status === 'cancelled').length;

  const overdueCount = projects.filter((p) =>
    isProjectOverdue(p.expected_completion, p.status)
  ).length;

  // Budget calculations
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const activeBudget = projects
    .filter((p) => ['planning', 'in_progress', 'on_hold'].includes(p.status))
    .reduce((acc, p) => acc + (p.budget || 0), 0);
  const completedValue = projects
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + (p.budget || 0), 0);

  if (totalProjects === 0) {
    return (
      <div
        id="projects-empty-dashboard"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-2xs transition-colors"
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No active projects</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Track industrial DG set commissions, solar installations, HT substations, and equipment overhauls from planning through to delivery.
        </p>
        <button
          id="btn-create-first-project"
          type="button"
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Project</span>
        </button>
      </div>
    );
  }

  return (
    <div id="project-management-dashboard" className="space-y-4 mb-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Project Budget */}
        <div
          id="kpi-total-project-budget"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Project Budget
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatProjectBudget(totalBudget)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cumulative value across all {totalProjects} projects
          </p>
        </div>

        {/* Active Project Budget */}
        <div
          id="kpi-active-project-budget"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/20 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Active Project Budget
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-200 tracking-tight">
            {formatProjectBudget(activeBudget)}
          </div>
          <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-1">
            Planning, In Progress &amp; On Hold workloads
          </p>
        </div>

        {/* Completed Project Value */}
        <div
          id="kpi-completed-project-value"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Completed Project Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 tracking-tight">
            {formatProjectBudget(completedValue)}
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1">
            Successfully delivered and commissioned
          </p>
        </div>
      </div>

      {/* Operational Breakdown Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Operations Breakdown</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
              {totalProjects} Total
            </span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{overdueCount} Overdue Projects</span>
            </div>
          )}
        </div>

        {/* Status Counts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
          {/* Planning */}
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-300 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Planning</span>
            </div>
            <div className="text-xl font-extrabold text-blue-900 dark:text-blue-200">{planningCount}</div>
          </div>

          {/* In Progress */}
          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-300 mb-1">
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">In Progress</span>
            </div>
            <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">{inProgressCount}</div>
          </div>

          {/* On Hold */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
              <PauseCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">On Hold</span>
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{onHoldCount}</div>
          </div>

          {/* Completed */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Completed</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">{completedCount}</div>
          </div>

          {/* Cancelled */}
          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-300 mb-1">
              <XCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Cancelled</span>
            </div>
            <div className="text-xl font-extrabold text-rose-900 dark:text-rose-200">{cancelledCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
