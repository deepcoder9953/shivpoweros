import React from 'react';
import {
  Project,
  getProjectStatusLabel,
  getProjectStatusBadgeClass,
  formatProjectBudget,
  isProjectOverdue,
} from '../../types/project';
import {
  Building2,
  Calendar,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  FolderKanban,
  User,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
}) => {
  if (projects.length === 0) {
    return (
      <div
        id="projects-no-results"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-2xs transition-colors"
      >
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <FolderKanban className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No matching projects found</h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          Try adjusting your search query, status filters, or date ranges.
        </p>
        <button
          type="button"
          onClick={onCreateProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Project</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Responsive Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="projects-table">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Expected End</th>
                <th className="py-3 px-4 text-right">Budget</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 min-w-[140px]">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((project) => {
                const overdue = isProjectOverdue(project.expected_completion, project.status);
                const progress = project.progress_percentage ?? 0;
                const statusBadge = getProjectStatusBadgeClass(project.status);
                const statusLabel = getProjectStatusLabel(project.status);

                return (
                  <tr
                    key={project.id}
                    id={`project-row-${project.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onViewProject(project)}
                  >
                    {/* Project Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {project.project_name}
                          </div>
                          {project.description && (
                            <div className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {project.customer?.company_name || project.customer_name || 'Client'}
                        </span>
                      </div>
                      {project.customer?.contact_person && (
                        <div className="text-2xs text-slate-400 dark:text-slate-500 pl-5">
                          {project.customer.contact_person}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold border ${statusBadge}`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 text-2xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {project.start_date || '—'}
                    </td>

                    {/* Expected Completion */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-2xs text-slate-700 dark:text-slate-300 font-medium">
                        {project.expected_completion || '—'}
                      </div>
                      {overdue && (
                        <span className="inline-flex items-center gap-1 text-3xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded-sm mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Overdue
                        </span>
                      )}
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right whitespace-nowrap">
                      {formatProjectBudget(project.budget || 0)}
                    </td>

                    {/* Assigned To */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-2xs text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {project.assigned_to ? project.assigned_to.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="truncate max-w-[120px]">
                          {project.assigned_to || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-2xs mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{progress}%</span>
                        <span className="text-3xs text-slate-400 dark:text-slate-500">
                          {project.completed_tasks_count ?? 0}/{project.tasks_count ?? 0} tasks
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100
                              ? 'bg-emerald-500'
                              : progress > 50
                              ? 'bg-blue-600'
                              : progress > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(progress, 2))}%` }}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`btn-view-project-${project.id}`}
                          type="button"
                          title="View Project Details"
                          onClick={() => onViewProject(project)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-project-${project.id}`}
                          type="button"
                          title="Edit Project"
                          onClick={() => onEditProject(project)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-project-${project.id}`}
                          type="button"
                          title="Delete Project"
                          onClick={() => onDeleteProject(project)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {projects.map((project) => {
          const overdue = isProjectOverdue(project.expected_completion, project.status);
          const progress = project.progress_percentage ?? 0;
          const statusBadge = getProjectStatusBadgeClass(project.status);
          const statusLabel = getProjectStatusLabel(project.status);

          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              onClick={() => onViewProject(project)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs active:bg-slate-50 dark:active:bg-slate-800/60 transition-all space-y-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                      {project.project_name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.customer?.company_name || project.customer_name || 'Client'}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold border shrink-0 ${statusBadge}`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Overdue alert if applicable */}
              {overdue && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-2xs font-bold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Expected completion date passed ({project.expected_completion})</span>
                </div>
              )}

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Task Completion: {progress}%</span>
                  <span className="text-3xs text-slate-400 dark:text-slate-500">
                    {project.completed_tasks_count ?? 0}/{project.tasks_count ?? 0} tasks
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      progress === 100
                        ? 'bg-emerald-500'
                        : progress > 50
                        ? 'bg-blue-600'
                        : progress > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(progress, 2))}%` }}
                  />
                </div>
              </div>

              {/* Footer row: Budget, Assigned, Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 uppercase font-bold block">Budget</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {formatProjectBudget(project.budget || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onViewProject(project)}
                    className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditProject(project)}
                    className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProject(project)}
                    className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
