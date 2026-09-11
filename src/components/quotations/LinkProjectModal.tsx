import React, { useState, useEffect } from 'react';
import { Quotation } from '../../types/quotation';
import { Project } from '../../types/project';
import { projectsService } from '../../lib/projectsService';
import { quotationsService } from '../../lib/quotationsService';
import {
  X,
  Link,
  Building2,
  Calendar,
  CheckCircle2,
  FolderPlus,
  AlertCircle,
} from 'lucide-react';

interface LinkProjectModalProps {
  isOpen: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onLinked: () => void;
  onCreateNewProject?: (quotation: Quotation) => void;
}

export const LinkProjectModal: React.FC<LinkProjectModalProps> = ({
  isOpen,
  quotation,
  onClose,
  onLinked,
  onCreateNewProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quotation) {
      loadProjects();
      setSelectedProjectId(quotation.project_id || '');
    }
  }, [isOpen, quotation]);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await projectsService.getProjects();
      setProjects(res.projects || []);
      if (!quotation?.project_id && res.projects?.length > 0) {
        // Try matching by customer_id
        const matched = res.projects.find((p) => p.customer_id === quotation?.customer_id);
        if (matched) {
          setSelectedProjectId(matched.id);
        } else {
          setSelectedProjectId(res.projects[0].id);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !quotation) return null;

  const handleLink = async () => {
    if (!selectedProjectId) {
      setError('Please select an existing project to link.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await quotationsService.linkToProject(quotation.id, selectedProjectId);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to link quotation to project.');
    } else {
      onLinked();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Link Quotation to Project
              </h2>
              <p className="text-xs text-slate-500">
                Associate accepted commercial quotation with execution project
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Quotation:</span>
              <span className="font-mono font-bold text-slate-900">{quotation.quotation_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Client:</span>
              <span className="font-semibold text-slate-800">
                {quotation.customer?.company_name || quotation.customer_name || 'Client Account'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Quotation Value:</span>
              <span className="font-bold text-emerald-700">₹{quotation.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Existing Project
            </label>
            {isLoading ? (
              <p className="text-slate-500 italic py-2">Loading available projects...</p>
            ) : projects.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                No existing projects found in the system. Project management will be fully configurable in Step 8.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {projects.map((proj) => {
                  const isSelected = selectedProjectId === proj.id;
                  const isMatchingCustomer = proj.customer_id === quotation.customer_id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{proj.project_name}</span>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {proj.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-2xs text-slate-500">
                        <span>Client: {proj.customer_name || 'Assigned Client'}</span>
                        {isMatchingCustomer && (
                          <span className="text-blue-600 font-bold">Matching Customer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {onCreateNewProject && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-2xs text-slate-500">Need a dedicated project for this quote?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateNewProject(quotation);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors text-2xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Create New Project</span>
              </button>
            </div>
          )}

          <p className="text-2xs text-slate-500 leading-relaxed">
            Note: Linking stores the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">project_id</code> on this quotation record without modifying the project's independent timeline.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={isSubmitting || projects.length === 0 || !selectedProjectId}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            {isSubmitting ? 'Linking...' : 'Confirm Link'}
          </button>
        </div>
      </div>
    </div>
  );
};
