import React, { useState, useEffect } from 'react';
import {
  Project,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  getProjectStatusLabel,
  getProjectStatusBadgeClass,
  formatProjectBudget,
  isProjectOverdue,
  calculateProjectProgress,
} from '../../types/project';
import {
  Task,
  isTaskOverdue,
  getTaskStatusBadgeClass,
  getTaskPriorityBadgeClass,
  normalizeTaskStatus,
  normalizeTaskPriority,
} from '../../types/task';
import { ActivityRecord } from '../../types/activity';
import { tasksService } from '../../lib/tasksService';
import { activitiesService } from '../../lib/activitiesService';
import { projectsService } from '../../lib/projectsService';
import {
  X,
  FolderKanban,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  FileText,
  History,
  Phone,
  Mail,
  ExternalLink,
  Check,
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onOpenQuotation?: (quotationId: string) => void;
  onProjectUpdated?: (updatedProject: Project) => void;
  onAddTask: (projectId: string, projectName: string) => void;
  onEditTask: (task: Task) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  project,
  onClose,
  onEditProject,
  onDeleteProject,
  onOpenQuotation,
  onProjectUpdated,
  onAddTask,
  onEditTask,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'activity' | 'quotation'>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>('planning');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load tasks and activities whenever project opens
  useEffect(() => {
    if (!isOpen || !project) return;

    setCurrentStatus(project.status);
    loadProjectTasks(project.id);
    loadProjectActivities(project.id);
  }, [isOpen, project]);

  const loadProjectTasks = async (projectId: string) => {
    setLoadingTasks(true);
    try {
      const { tasks: projTasks } = await tasksService.getTasksByProject(projectId);
      setTasks(projTasks);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadProjectActivities = async (projectId: string) => {
    setLoadingActivities(true);
    try {
      const { activities: projActivities } = await activitiesService.getActivitiesByProject(projectId);
      setActivities(projActivities);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (!isOpen || !project) return null;

  const overdue = isProjectOverdue(project.expected_completion, currentStatus);
  const progress = calculateProjectProgress(tasks);
  const completedTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'completed');
  const allTasksDone = tasks.length > 0 && completedTasks.length === tasks.length;

  const handleQuickStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await projectsService.updateProject(project.id, { status: newStatus });
      if (res.project) {
        setCurrentStatus(newStatus);
        if (onProjectUpdated) onProjectUpdated(res.project);
        loadProjectActivities(project.id);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const current = normalizeTaskStatus(task.status);
    const nextStatus = current === 'completed' ? 'todo' : 'completed';
    const res = await tasksService.updateTask(task.id, { status: nextStatus });
    if (res.task) {
      const updated = tasks.map((t) => (t.id === task.id ? res.task! : t));
      setTasks(updated);
      const updatedProgress = calculateProjectProgress(updated);
      projectsService.updateProject(project.id, {}).then((pRes) => {
        if (pRes.project && onProjectUpdated) {
          onProjectUpdated({
            ...pRes.project,
            tasks_count: updated.length,
            completed_tasks_count: updated.filter((t) => normalizeTaskStatus(t.status) === 'completed').length,
            progress_percentage: updatedProgress,
          });
        }
      });
      loadProjectActivities(project.id);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    const res = await tasksService.deleteTask(taskId);
    if (res.success) {
      const remaining = tasks.filter((t) => t.id !== taskId);
      setTasks(remaining);
      const updatedProgress = calculateProjectProgress(remaining);
      if (onProjectUpdated) {
        onProjectUpdated({
          ...project,
          tasks_count: remaining.length,
          completed_tasks_count: remaining.filter((t) => normalizeTaskStatus(t.status) === 'completed').length,
          progress_percentage: updatedProgress,
        });
      }
      loadProjectActivities(project.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="project-detail-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {project.project_name}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getProjectStatusBadgeClass(
                    currentStatus
                  )}`}
                >
                  {getProjectStatusLabel(currentStatus)}
                </span>
                {overdue && (
                  <span className="inline-flex items-center gap-1 text-2xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {project.customer?.company_name || project.customer_name || 'Client'}
                </span>
                {project.quotation?.quotation_number && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Quote #{project.quotation.quotation_number}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Quick Status Selector */}
            <select
              id="select-quick-project-status"
              value={currentStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleQuickStatusChange(e.target.value as ProjectStatus)}
              className="text-xs font-semibold py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((st) => (
                <option key={st} value={st}>
                  Status: {PROJECT_STATUS_LABELS[st]}
                </option>
              ))}
            </select>

            <button
              id="btn-edit-project-header"
              type="button"
              onClick={() => onEditProject(project)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              id="btn-delete-project-header"
              type="button"
              onClick={() => onDeleteProject(project)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex space-x-6 overflow-x-auto bg-white dark:bg-slate-900 transition-colors">
          <button
            type="button"
            id="tab-project-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            id="tab-project-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            type="button"
            id="tab-project-activity"
            onClick={() => setActiveTab('activity')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity ({activities.length})</span>
          </button>

          <button
            type="button"
            id="tab-project-quotation"
            onClick={() => setActiveTab('quotation')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quotation'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Quotation</span>
            {project.quotation_id && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overdue Alert banner if past expected date */}
              {overdue && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Project Delivery is Overdue</h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      The expected completion date ({project.expected_completion}) has passed while the project is in{' '}
                      <strong>{getProjectStatusLabel(currentStatus)}</strong> status. Review pending tasks or adjust the milestone schedule.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress & Lifecycle Stage Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Execution Progress
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {progress}% Completed
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Deliverable Tasks
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {completedTasks.length} of {tasks.length} Done
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-blue-200/50 dark:bg-blue-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress === 100
                        ? 'bg-emerald-500'
                        : progress > 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(progress, 3))}%` }}
                  />
                </div>

                {/* Project Lifecycle Stepper */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-2xs font-semibold">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      ['planning', 'in_progress', 'on_hold', 'completed'].includes(currentStatus)
                        ? 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1. Planning
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${
                      ['in_progress', 'on_hold', 'completed'].includes(currentStatus)
                        ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    2. In Progress
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${
                      currentStatus === 'completed'
                        ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                        : currentStatus === 'on_hold'
                        ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    3. Quality / On Hold
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${
                      currentStatus === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    4. Completed
                  </div>
                </div>
              </div>

              {/* 2-Column Details Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Relationship Card */}
                <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Customer Profile</span>
                    </span>
                    <span className="text-2xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                      Linked Account
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {project.customer?.company_name || project.customer_name || 'Customer'}
                    </h5>
                    {project.customer?.contact_person && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Contact: {project.customer.contact_person}</span>
                      </div>
                    )}
                    {project.customer?.phone && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.customer.phone}</span>
                      </div>
                    )}
                    {project.customer?.email && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{project.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Parameters */}
                <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Key Metrics &amp; Team
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Budget</span>
                      <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-base">
                        {formatProjectBudget(project.budget || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned Lead</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {project.assigned_to || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Start Date</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {project.start_date || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expected Completion</span>
                      <span
                        className={`font-semibold ${
                          overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {project.expected_completion || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Scope of Work */}
              <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Description &amp; Scope of Work
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.description ||
                    'No technical scope or description specified for this power installation project.'}
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  id="btn-overview-add-task"
                  type="button"
                  onClick={() => onAddTask(project.id, project.project_name)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProject(project)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Project Details</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TASKS TAB ================= */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task Header & Quick Add */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Action Items</h4>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                    {completedTasks.length}/{tasks.length} Completed
                  </span>
                </div>
                <button
                  id="btn-tasks-tab-add"
                  type="button"
                  onClick={() => onAddTask(project.id, project.project_name)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Task</span>
                </button>
              </div>

              {/* All tasks completed celebratory banner */}
              {allTasksDone && currentStatus !== 'completed' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>All project tasks are finished! Ready for delivery handover.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange('completed')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Mark Project Completed
                  </button>
                </div>
              )}

              {/* Task List */}
              {loadingTasks ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No tasks created yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                    Create electrical testing, site survey, CEIG approvals, or commissioning checklists.
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddTask(project.id, project.project_name)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Task</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const normStatus = normalizeTaskStatus(task.status);
                    const normPriority = normalizeTaskPriority(task.priority);
                    const taskOverdue = isTaskOverdue(task.due_date, task.status);
                    const isDone = normStatus === 'completed';

                    return (
                      <div
                        key={task.id}
                        id={`task-item-${task.id}`}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-700'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {task.title}
                              </span>
                              {/* Status Badge */}
                              <span
                                className={`text-3xs font-bold px-2 py-0.5 rounded-md border ${getTaskStatusBadgeClass(
                                  task.status
                                )}`}
                              >
                                {normStatus === 'in_progress'
                                  ? 'In Progress'
                                  : normStatus === 'completed'
                                  ? 'Done'
                                  : 'To Do'}
                              </span>
                              {/* Priority Badge */}
                              <span
                                className={`text-3xs font-bold px-2 py-0.5 rounded-md border ${getTaskPriorityBadgeClass(
                                  task.priority
                                )}`}
                              >
                                {normPriority.toUpperCase()}
                              </span>
                              {taskOverdue && (
                                <span className="text-3xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Overdue
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-2xs text-slate-400 mt-2">
                              {task.due_date && (
                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due {task.due_date.split('T')[0]}</span>
                                </span>
                              )}
                              {task.assigned_to && (
                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                  <User className="w-3 h-3" />
                                  <span>{task.assigned_to}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= ACTIVITY TAB ================= */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project History &amp; Audit Trail</h4>
                <span className="text-xs text-slate-400">
                  {activities.length} Recorded Events
                </span>
              </div>

              {loadingActivities ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No project activity recorded yet</p>
                  <p className="text-xs text-slate-400">
                    Operations, status transitions, and milestones will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{act.action}</span>
                          <span className="text-3xs text-slate-400">
                            {new Date(act.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{act.description}</p>
                        {act.performed_by && (
                          <div className="text-2xs text-slate-400 mt-1">
                            By: <span className="font-semibold text-slate-600 dark:text-slate-300">{act.performed_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= QUOTATION TAB ================= */}
          {activeTab === 'quotation' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Commercial &amp; Quotation Link</h4>
              </div>

              {project.quotation ? (
                <div className="p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-blue-200 dark:border-blue-800/60 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                          Quotation #{project.quotation.quotation_number}
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {project.quotation.title}
                        </h5>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-bold capitalize">
                      {project.quotation.status}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        Approved Quotation Total
                      </span>
                      <span className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">
                        {formatProjectBudget(project.quotation.total)}
                      </span>
                    </div>

                    {onOpenQuotation && (
                      <button
                        type="button"
                        onClick={() => onOpenQuotation(project.quotation!.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Quotation Details</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : project.quotation_id ? (
                <div className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Linked Quotation ID: </span>
                  <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-slate-800 dark:text-slate-200">
                    {project.quotation_id}
                  </code>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No quotation linked to this project</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    This project was created directly or has not been associated with a formal proposal document.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Created on {new Date(project.created_at).toLocaleDateString('en-IN')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
