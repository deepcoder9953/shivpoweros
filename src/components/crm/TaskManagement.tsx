import React, { useState } from 'react';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../../types/task';
import { Lead, TeamMember } from '../../types/lead';
import { Customer } from '../../types/customer';
import { TaskFormModal } from './TaskFormModal';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Check,
  User,
  Building2,
  Calendar,
} from 'lucide-react';

interface TaskManagementProps {
  tasks?: Task[];
  leads?: Lead[];
  customers?: Customer[];
  teamMembers?: TeamMember[];
  onCreateTask: (data: TaskFormData) => Promise<boolean>;
  onUpdateTask: (id: string, data: Partial<TaskFormData>) => Promise<boolean>;
  onDeleteTask: (id: string) => Promise<boolean>;
  onViewLead?: (lead: Lead) => void;
  onViewCustomer?: (customer: Customer) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks = [],
  leads = [],
  customers = [],
  teamMembers = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onViewLead,
  onViewCustomer,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all_open');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const safeTasks = tasks || [];

  const filteredTasks = safeTasks.filter((task) => {
    // Status filter
    if (statusFilter === 'all_open') {
      if (task.status === 'Completed' || task.status === 'Cancelled') return false;
    } else if (statusFilter !== 'all') {
      if (task.status !== statusFilter) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    return true;
  });

  const handleToggleComplete = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await onUpdateTask(task.id, {
      status: nextStatus,
    });
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'High':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Medium':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Low':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Task Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal team assignments, site engineering checks, and customer deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Task</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all_open')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all_open'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Open Tasks
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'Pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('In Progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'Completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden text-xs bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 transition-colors">
            <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No tasks found</p>
            <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
              Create a task to assign an engineering deliverable or review client files.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const lead = task.lead_id ? leads.find((l) => l.id === task.lead_id) : null;
            const customer = task.customer_id ? customers.find((c) => c.id === task.customer_id) : null;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-4 rounded-2xl border transition-all shadow-2xs flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task)}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
                  }`}
                  title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-xs font-bold ${
                        isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-3xs font-bold border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-3xs font-semibold ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : task.status === 'In Progress'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : task.status === 'Cancelled'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{task.description}</p>
                  )}

                  {/* Metadata line */}
                  <div className="mt-2 flex items-center gap-3 text-2xs sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {lead && (
                      <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
                        <User className="w-3.5 h-3.5" />
                        <span>Lead: {lead.company_name || lead.contact_person}</span>
                      </span>
                    )}

                    {customer && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Customer: {customer.company_name || customer.contact_person}</span>
                      </span>
                    )}

                    {task.project_name && (
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Project: {task.project_name}</span>
                    )}

                    {task.due_date && (
                      <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due {new Date(task.due_date).toLocaleDateString('en-IN')}</span>
                      </span>
                    )}

                    <span className="text-slate-400 dark:text-slate-500">Assigned: {task.assigned_to || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={async (data) => {
          if (editingTask) {
            return onUpdateTask(editingTask.id, data);
          } else {
            return onCreateTask(data);
          }
        }}
        initialData={editingTask}
        leads={leads}
        customers={customers}
        teamMembers={teamMembers}
      />
    </div>
  );
};
