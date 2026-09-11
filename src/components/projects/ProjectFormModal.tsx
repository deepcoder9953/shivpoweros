import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { TeamMember } from '../../types/lead';
import {
  Project,
  ProjectFormData,
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  formatProjectBudget,
} from '../../types/project';
import {
  X,
  FolderKanban,
  Building2,
  Calendar,
  IndianRupee,
  User,
  AlertCircle,
  Phone,
  Mail,
  Check,
} from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<{ success: boolean; error?: string }>;
  initialData?: Project | null;
  prefillCustomer?: Customer | null;
  prefillQuotation?: {
    id: string;
    title?: string;
    total: number;
    customer_id: string;
  } | null;
  customers: Customer[];
  teamMembers: TeamMember[];
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  prefillCustomer,
  prefillQuotation,
  customers,
  teamMembers,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [projectName, setProjectName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [assignedTo, setAssignedTo] = useState('');
  const [budget, setBudget] = useState<string>('0');
  const [quotationId, setQuotationId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state on open / initialData change
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setProjectName(initialData.project_name || '');
      setCustomerId(initialData.customer_id || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.start_date || '');
      setExpectedCompletion(initialData.expected_completion || initialData.expected_completion_date || '');
      setStatus(initialData.status || 'planning');
      setAssignedTo(initialData.assigned_to || '');
      setBudget(String(initialData.budget ?? initialData.project_value ?? 0));
      setQuotationId(initialData.quotation_id || null);
    } else if (prefillQuotation) {
      // Pre-fill from accepted quotation
      setProjectName(prefillQuotation.title || 'Power Equipment Project');
      setCustomerId(prefillQuotation.customer_id || '');
      setDescription(`Created from Quotation total ₹${prefillQuotation.total.toLocaleString('en-IN')}`);
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpectedCompletion(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setStatus('planning');
      setAssignedTo(teamMembers[0]?.name || '');
      setBudget(String(prefillQuotation.total || 0));
      setQuotationId(prefillQuotation.id);
    } else if (prefillCustomer) {
      setProjectName('');
      setCustomerId(prefillCustomer.id);
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpectedCompletion('');
      setStatus('planning');
      setAssignedTo(prefillCustomer.assigned_to || teamMembers[0]?.name || '');
      setBudget('0');
      setQuotationId(null);
    } else {
      setProjectName('');
      setCustomerId(customers[0]?.id || '');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpectedCompletion('');
      setStatus('planning');
      setAssignedTo(teamMembers[0]?.name || '');
      setBudget('0');
      setQuotationId(null);
    }
    setErrors({});
  }, [isOpen, initialData, prefillQuotation, prefillCustomer, customers, teamMembers]);

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!projectName.trim()) {
      errs.projectName = 'Project name is required.';
    }
    if (!customerId) {
      errs.customerId = 'Customer selection is required.';
    }
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      errs.budget = 'Budget must be a valid positive number or 0.';
    }
    if (startDate && expectedCompletion) {
      if (new Date(expectedCompletion) < new Date(startDate)) {
        errs.expectedCompletion = 'Expected completion cannot precede start date.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: ProjectFormData = {
        customer_id: customerId,
        project_name: projectName.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        expected_completion: expectedCompletion || null,
        expected_completion_date: expectedCompletion || null,
        status,
        assigned_to: assignedTo || null,
        budget: Number(budget) || 0,
        project_value: Number(budget) || 0,
        quotation_id: quotationId,
      };

      const res = await onSubmit(payload);
      if (res.success) {
        onClose();
      } else {
        setErrors({ form: res.error || 'Failed to save project' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="project-form-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Project' : 'Create New Project'}
              </h3>
              <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update project deliverables, budget, and timeline'
                  : 'Define scope, customer relationship, and project allocation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {prefillQuotation && !isEditing && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <div>
                <span className="font-bold">Linked Quotation: </span>
                <span>Pre-filled from accepted quotation value {formatProjectBudget(prefillQuotation.total)}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold rounded-md text-3xs">
                Auto-Linking
              </span>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-project-name"
              type="text"
              placeholder="e.g. 500 kW Solar Installation / 250 kVA DG Commissioning"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 transition-all ${
                errors.projectName
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.projectName && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.projectName}</p>
            )}
          </div>

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Customer <span className="text-rose-500">*</span>
              </label>
              {selectedCustomer && (
                <span className="text-2xs text-slate-400 dark:text-slate-500">
                  {selectedCustomer.customer_type || 'Commercial Account'}
                </span>
              )}
            </div>
            <select
              id="select-project-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={isEditing && Boolean(initialData?.customer_id)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 transition-all ${
                errors.customerId
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            >
              <option value="">Select a Customer Account...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} — {c.contact_person || 'Contact'} ({c.phone})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.customerId}</p>
            )}

            {/* Selected Customer Card Preview */}
            {selectedCustomer && (
              <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{selectedCustomer.company_name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 pt-1 text-2xs sm:text-xs">
                  {selectedCustomer.contact_person && (
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.contact_person}</span>
                    </div>
                  )}
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-1 sm:col-span-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedCustomer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description / Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Scope of Work
            </label>
            <textarea
              id="textarea-project-description"
              rows={3}
              placeholder="Describe deliverables, technical specs, DG ratings, solar capacity, transformer kVA..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Budget & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project Budget (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-project-budget"
                  type="number"
                  min="0"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.budget
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.budget ? (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.budget}</p>
              ) : (
                <p className="text-2xs text-slate-400 dark:text-slate-500 mt-1">
                  Preview: {formatProjectBudget(Number(budget) || 0)}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project Status
              </label>
              <select
                id="select-project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {PROJECT_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline: Start Date & Expected Completion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Date</span>
              </label>
              <input
                id="input-project-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expected Completion</span>
              </label>
              <input
                id="input-project-expected-completion"
                type="date"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.expectedCompletion
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.expectedCompletion && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.expectedCompletion}</p>
              )}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned Project Manager / Lead</span>
            </label>
            <select
              id="select-project-assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-save-project"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
