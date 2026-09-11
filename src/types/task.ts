export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  project_id?: string | null;
  lead_id?: string | null;
  customer_id?: string | null;
  assigned_to?: string | null;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string;
  // Computed / joined fields
  project_name?: string;
  lead_name?: string;
  customer_name?: string;
  assigned_user_name?: string;
}

export interface TaskFormData {
  project_id?: string | null;
  lead_id?: string | null;
  customer_id?: string | null;
  assigned_to?: string | null;
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
  due_date?: string | null;
  completed_at?: string | null;
}

export function normalizeTaskStatus(status?: string | null): 'todo' | 'in_progress' | 'completed' {
  if (!status) return 'todo';
  const clean = status.trim().toLowerCase().replace(/\s+/g, '_');
  if (clean === 'completed' || clean === 'done') return 'completed';
  if (clean === 'in_progress' || clean === 'inprogress') return 'in_progress';
  return 'todo';
}

export function getTaskStatusLabel(status?: string | null): string {
  const norm = normalizeTaskStatus(status);
  switch (norm) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'To Do';
  }
}

export function getTaskStatusBadgeClass(status?: string | null): string {
  const norm = normalizeTaskStatus(status);
  switch (norm) {
    case 'todo':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function normalizeTaskPriority(priority?: string | null): 'low' | 'medium' | 'high' | 'urgent' {
  if (!priority) return 'medium';
  const clean = priority.trim().toLowerCase();
  if (clean === 'urgent') return 'urgent';
  if (clean === 'high') return 'high';
  if (clean === 'low') return 'low';
  return 'medium';
}

export function getTaskPriorityLabel(priority?: string | null): string {
  const norm = normalizeTaskPriority(priority);
  switch (norm) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'urgent':
      return 'Urgent';
    default:
      return 'Medium';
  }
}

export function getTaskPriorityBadgeClass(priority?: string | null): string {
  const norm = normalizeTaskPriority(priority);
  switch (norm) {
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'high':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'urgent':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

/**
 * If due_date < current date and status != completed -> Overdue
 */
export function isTaskOverdue(due_date?: string | null, status?: string | null): boolean {
  if (!due_date) return false;
  const norm = normalizeTaskStatus(status);
  if (norm === 'completed') return false;

  const targetDate = new Date(due_date);
  const now = new Date();
  targetDate.setHours(23, 59, 59, 999);
  return targetDate.getTime() < now.getTime();
}

