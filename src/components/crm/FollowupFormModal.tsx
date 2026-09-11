import React, { useState, useEffect } from 'react';
import { FollowupFormData, FollowupRecord, FollowupType, FollowupStatus } from '../../types/followup';
import { Lead, TeamMember } from '../../types/lead';
import { Customer } from '../../types/customer';
import { X, CalendarClock } from 'lucide-react';

interface FollowupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FollowupFormData) => Promise<boolean>;
  initialData?: FollowupRecord | null;
  targetLead?: Lead | null;
  targetCustomer?: Customer | null;
  leads: Lead[];
  customers: Customer[];
  teamMembers: TeamMember[];
}

export const FollowupFormModal: React.FC<FollowupFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  targetLead,
  targetCustomer,
  leads,
  customers,
  teamMembers,
}) => {
  const isEditing = Boolean(initialData);

  const [leadId, setLeadId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [followupType, setFollowupType] = useState<FollowupType>('Call');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('11:00');
  const [subject, setSubject] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [status, setStatus] = useState<FollowupStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setLeadId(initialData.lead_id || '');
      setCustomerId(initialData.customer_id || '');
      setFollowupType(initialData.followup_type || 'Call');
      const d = new Date(initialData.followup_date);
      setDate(d.toISOString().slice(0, 10));
      setTime(d.toTimeString().slice(0, 5));
      setSubject(initialData.subject || '');
      setNotes(initialData.notes || '');
      setAssignedTo(initialData.assigned_to || (teamMembers[0]?.name || 'Unassigned'));
      setStatus(initialData.status || 'Pending');
    } else {
      const tomorrow = new Date(Date.now() + 86400000);
      setDate(tomorrow.toISOString().slice(0, 10));
      setTime('11:00');
      setFollowupType('Call');
      setLeadId(targetLead?.id || '');
      setCustomerId(targetCustomer?.id || '');
      setSubject('');
      setNotes('');
      setAssignedTo(targetLead?.assigned_to || targetCustomer?.assigned_to || teamMembers[0]?.name || 'Unassigned');
      setStatus('Pending');
    }
    setErrorMsg(null);
  }, [initialData, targetLead, targetCustomer, isOpen, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (!leadId && !customerId) {
      setErrorMsg('Please select a Lead or Customer to attach this follow-up to.');
      return;
    }

    const isoDateTime = new Date(`${date}T${time || '10:00'}:00`).toISOString();

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const ok = await onSubmit({
        lead_id: leadId || null,
        customer_id: customerId || null,
        followup_date: isoDateTime,
        followup_type: followupType,
        subject: subject.trim() || `${followupType} interaction`,
        notes: notes.trim(),
        assigned_to: assignedTo,
        status: status,
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="followup-form-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Edit Follow-up' : 'Schedule Follow-up'}
              </h3>
              <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400">
                Set a client callback, site visit, or WhatsApp reminder
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form id="followup-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Relation Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Lead
              </label>
              <select
                value={leadId}
                onChange={(e) => {
                  setLeadId(e.target.value);
                  if (e.target.value) setCustomerId('');
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">None (or select below)</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company_name || l.contact_person} ({l.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Or Link to Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  if (e.target.value) setLeadId('');
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">None (or select above)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.contact_person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interaction Type & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interaction Channel
              </label>
              <select
                value={followupType}
                onChange={(e) => setFollowupType(e.target.value as FollowupType)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Visit">Site Visit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject / Objective
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Discuss revised quotation discount and warranty terms"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Discussion Notes / Talking Points
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific items to verify during the call/visit..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status if editing */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FollowupStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="followup-form"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Follow-up'}
          </button>
        </div>
      </div>
    </div>
  );
};
