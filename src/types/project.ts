export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface Project {
  id: string;
  customer_id: string;
  project_name: string;
  description?: string | null;
  start_date?: string | null;
  expected_completion?: string | null;
  status: ProjectStatus;
  assigned_to?: string | null;
  budget: number;
  created_at: string;
  updated_at?: string;
  // Relationships & computed helpers
  customer_name?: string;
  customer?: {
    id?: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
  } | null;
  quotation_id?: string | null;
  quotation?: {
    id: string;
    quotation_number: string;
    title?: string;
    total?: number;
    status?: string;
  } | null;
  // Progress & task counts
  tasks_count?: number;
  completed_tasks_count?: number;
  progress_percentage?: number;
  // Backward compatibility fields
  expected_completion_date?: string | null;
  actual_completion_date?: string | null;
  project_value?: number;
  notes?: string;
}

export interface ProjectFormData {
  customer_id: string;
  project_name: string;
  description?: string | null;
  start_date?: string | null;
  expected_completion?: string | null;
  status?: ProjectStatus;
  assigned_to?: string | null;
  budget: number;
  quotation_id?: string | null;
  // Backward compatibility fields
  expected_completion_date?: string | null;
  actual_completion_date?: string | null;
  project_value?: number;
  notes?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function normalizeProjectStatus(status?: string | null): ProjectStatus {
  if (!status) return 'planning';
  const clean = status.trim().toLowerCase().replace(/\s+/g, '_');
  if (clean === 'in_progress' || clean === 'inprogress') return 'in_progress';
  if (clean === 'on_hold' || clean === 'onhold') return 'on_hold';
  if (clean === 'completed') return 'completed';
  if (clean === 'cancelled' || clean === 'canceled') return 'cancelled';
  return 'planning';
}

export function getProjectStatusLabel(status?: string | null): string {
  const norm = normalizeProjectStatus(status);
  return PROJECT_STATUS_LABELS[norm] || 'Planning';
}

export function getProjectStatusBadgeClass(status?: string | null): string {
  const norm = normalizeProjectStatus(status);
  switch (norm) {
    case 'planning':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'in_progress':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'on_hold':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

/**
 * If expected_completion < current date and status != completed (or cancelled), project is overdue
 */
export function isProjectOverdue(expected_completion?: string | null, status?: string | null): boolean {
  if (!expected_completion) return false;
  const norm = normalizeProjectStatus(status);
  if (norm === 'completed' || norm === 'cancelled') return false;

  const targetDate = new Date(expected_completion);
  const now = new Date();
  targetDate.setHours(23, 59, 59, 999);
  return targetDate.getTime() < now.getTime();
}

/**
 * Progress formula: (completed tasks / total tasks) * 100
 * If there are no tasks: 0%
 */
export function calculateProjectProgress(tasks: { status?: string | null }[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => {
    const s = (t.status || '').toLowerCase();
    return s === 'completed';
  }).length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Format project budget to Indian Rupee standard (e.g., ₹2,50,000)
 */
export function formatProjectBudget(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

