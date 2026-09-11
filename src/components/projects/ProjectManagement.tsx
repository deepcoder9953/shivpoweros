import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectFormData, normalizeProjectStatus } from '../../types/project';
import { Customer } from '../../types/customer';
import { TeamMember } from '../../types/lead';
import { Task, TaskFormData } from '../../types/task';
import { projectsService } from '../../lib/projectsService';
import { tasksService } from '../../lib/tasksService';
import { ProjectDashboard } from './ProjectDashboard';
import { ProjectFilterBar, ProjectFilterState } from './ProjectFilterBar';
import { ProjectList } from './ProjectList';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectTaskModal } from './ProjectTaskModal';
import { DeleteProjectConfirmModal } from './DeleteProjectConfirmModal';
import {
  FolderKanban,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProjectManagementProps {
  customers: Customer[];
  teamMembers: TeamMember[];
  initialProjectAction?: {
    action: 'create' | 'create_from_quotation';
    quotation?: {
      id: string;
      title: string;
      total: number;
      customer_id: string;
    };
  } | null;
  onOpenQuotation?: (quotationId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  customers,
  teamMembers,
  initialProjectAction,
  onOpenQuotation,
  onNavigateToTab,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<ProjectFilterState>({
    searchQuery: '',
    status: 'all',
    customerId: 'all',
    assignedTo: 'all',
    startDateFrom: '',
    expectedCompletionTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Modal Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);

  // Task Modal Controls
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalProjectId, setTaskModalProjectId] = useState<string>('');
  const [taskModalProjectName, setTaskModalProjectName] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Handle initial project action if directed from Quick Create or Quotation acceptance
  useEffect(() => {
    if (initialProjectAction?.action === 'create' || initialProjectAction?.action === 'create_from_quotation') {
      setEditingProject(null);
      setIsFormOpen(true);
    }
  }, [initialProjectAction]);

  // Load Projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsService.getProjects();
      setProjects(res.projects);
      setIsLive(res.isLive);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.project_name.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCust =
            (p.customer?.company_name || '').toLowerCase().includes(q) ||
            (p.customer?.contact_person || '').toLowerCase().includes(q) ||
            (p.customer_name || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCust) return false;
        }

        // Status
        if (filters.status !== 'all') {
          if (p.status !== filters.status) return false;
        }

        // Customer
        if (filters.customerId !== 'all') {
          if (p.customer_id !== filters.customerId) return false;
        }

        // Assigned To
        if (filters.assignedTo !== 'all') {
          if ((p.assigned_to || '').toLowerCase() !== filters.assignedTo.toLowerCase()) return false;
        }

        // Start Date From
        if (filters.startDateFrom && p.start_date) {
          if (p.start_date < filters.startDateFrom) return false;
        }

        // Expected Completion To
        if (filters.expectedCompletionTo && p.expected_completion) {
          if (p.expected_completion > filters.expectedCompletionTo) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let fieldA: any = a.created_at;
        let fieldB: any = b.created_at;

        switch (filters.sortBy) {
          case 'project_name':
            fieldA = a.project_name.toLowerCase();
            fieldB = b.project_name.toLowerCase();
            break;
          case 'customer':
            fieldA = (a.customer?.company_name || a.customer_name || '').toLowerCase();
            fieldB = (b.customer?.company_name || b.customer_name || '').toLowerCase();
            break;
          case 'budget':
            fieldA = a.budget || 0;
            fieldB = b.budget || 0;
            break;
          case 'start_date':
            fieldA = a.start_date || '';
            fieldB = b.start_date || '';
            break;
          case 'expected_completion':
            fieldA = a.expected_completion || '';
            fieldB = b.expected_completion || '';
            break;
          case 'status':
            fieldA = a.status;
            fieldB = b.status;
            break;
          case 'created_at':
          default:
            fieldA = a.created_at;
            fieldB = b.created_at;
            break;
        }

        if (fieldA < fieldB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, filters]);

  // Project CRUD Handlers
  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleSaveProject = async (data: ProjectFormData): Promise<{ success: boolean; error?: string }> => {
    if (editingProject) {
      const res = await projectsService.updateProject(editingProject.id, data);
      if (res.project) {
        showToast('success', `Project "${res.project.project_name}" updated successfully.`);
        await fetchProjects();
        if (detailProject && detailProject.id === res.project.id) {
          setDetailProject(res.project);
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = await projectsService.createProject(data);
      if (res.project) {
        showToast('success', `Project "${res.project.project_name}" created successfully.`);
        await fetchProjects();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const handleDeleteProject = async (projectId: string): Promise<{ success: boolean; error?: string }> => {
    const res = await projectsService.deleteProject(projectId);
    if (res.success) {
      showToast('success', 'Project removed successfully.');
      if (detailProject?.id === projectId) {
        setDetailProject(null);
      }
      await fetchProjects();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Task Handlers
  const handleOpenAddTask = (projectId: string, projectName: string) => {
    setTaskModalProjectId(projectId);
    setTaskModalProjectName(projectName);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskModalProjectId(task.project_id || '');
    setTaskModalProjectName('');
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: TaskFormData): Promise<{ success: boolean; error?: string }> => {
    if (editingTask) {
      const res = await tasksService.updateTask(editingTask.id, data);
      if (res.task) {
        showToast('success', 'Task updated.');
        await fetchProjects();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = await tasksService.createTask(data);
      if (res.task) {
        showToast('success', 'Task created.');
        await fetchProjects();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  return (
    <div id="project-management-module" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="project-toast"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Project Management &amp; Operations
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs sm:text-2xs font-bold ${
                isLive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{isLive ? 'Supabase Connected' : 'Local / Offline Mode'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track industrial DG set installations, solar turnkeys, HT substations, and equipment overhaul workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-refresh-projects"
            type="button"
            onClick={fetchProjects}
            disabled={loading}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-2xs"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
          <button
            id="btn-create-project-primary"
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Project</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <ProjectDashboard
        projects={projects}
        onCreateProject={handleOpenCreate}
      />

      {/* Filters Bar */}
      <ProjectFilterBar
        filters={filters}
        onApplyFilters={(f) => setFilters(f)}
        onResetFilters={() =>
          setFilters({
            searchQuery: '',
            status: 'all',
            customerId: 'all',
            assignedTo: 'all',
            startDateFrom: '',
            expectedCompletionTo: '',
            sortBy: 'created_at',
            sortOrder: 'desc',
          })
        }
        customers={customers}
        teamMembers={teamMembers}
        totalResults={filteredProjects.length}
      />

      {/* Project Table / Card List */}
      <ProjectList
        projects={filteredProjects}
        onViewProject={(p) => setDetailProject(p)}
        onEditProject={handleOpenEdit}
        onDeleteProject={(p) => setDeleteConfirmProject(p)}
        onCreateProject={handleOpenCreate}
      />

      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        initialData={editingProject}
        prefillQuotation={
          initialProjectAction?.action === 'create_from_quotation'
            ? initialProjectAction.quotation
            : null
        }
        customers={customers}
        teamMembers={teamMembers}
      />

      {/* Project Detail Modal (Overview, Tasks, Activity, Quotation) */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        project={detailProject}
        onClose={() => setDetailProject(null)}
        onEditProject={(p) => {
          setDetailProject(null);
          handleOpenEdit(p);
        }}
        onDeleteProject={(p) => {
          setDetailProject(null);
          setDeleteConfirmProject(p);
        }}
        onOpenQuotation={onOpenQuotation}
        onProjectUpdated={(updated) => {
          setDetailProject(updated);
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
        onAddTask={handleOpenAddTask}
        onEditTask={handleOpenEditTask}
      />

      {/* Project Task Modal */}
      <ProjectTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        projectId={taskModalProjectId}
        projectName={taskModalProjectName}
        initialData={editingTask}
        teamMembers={teamMembers}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProjectConfirmModal
        isOpen={Boolean(deleteConfirmProject)}
        project={deleteConfirmProject}
        onClose={() => setDeleteConfirmProject(null)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};
