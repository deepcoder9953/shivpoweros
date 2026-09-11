import React, { useState } from 'react';
import { Project } from '../../types/project';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteProjectConfirmModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirm: (projectId: string) => Promise<{ success: boolean; error?: string }>;
}

export const DeleteProjectConfirmModal: React.FC<DeleteProjectConfirmModalProps> = ({
  isOpen,
  project,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await onConfirm(project.id);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to delete project');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="delete-project-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
            Delete Project?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
            This action cannot be undone. All associated tasks and timeline records will also be removed.
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center mb-4">
            <div className="text-3xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Project Name</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{project.project_name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Client: {project.customer?.company_name || project.customer_name || 'Customer'}
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete-project"
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
