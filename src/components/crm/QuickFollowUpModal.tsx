import React, { useState } from 'react';
import { Lead, FollowUp } from '../../types/lead';
import { leadsService } from '../../lib/leadsService';
import { X, Calendar, Clock, MessageSquare, Phone, Users, MapPin } from 'lucide-react';

interface QuickFollowUpModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onFollowUpCreated: () => void;
}

export const QuickFollowUpModal: React.FC<QuickFollowUpModalProps> = ({
  isOpen,
  lead,
  onClose,
  onFollowUpCreated,
}) => {
  const [type, setType] = useState<FollowUp['type']>('Call');
  // Default to tomorrow at 10:00 AM
  const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  defaultDate.setHours(10, 0, 0, 0);
  const formattedDefault = defaultDate.toISOString().slice(0, 16);

  const [scheduledAt, setScheduledAt] = useState(formattedDefault);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;

    setIsSubmitting(true);
    try {
      await leadsService.createFollowUp(lead.id, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        type,
        notes: notes.trim(),
      });
      onFollowUpCreated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const followUpTypes: { id: FollowUp['type']; label: string; icon: React.ReactNode }[] = [
    { id: 'Call', label: 'Phone Call', icon: <Phone className="w-3.5 h-3.5" /> },
    { id: 'Site Visit', label: 'Site Survey', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Meeting', label: 'Client Meeting', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'WhatsApp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'Email', label: 'Email Proposal', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="quick-followup-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Schedule Follow-up</h3>
            <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              For: <strong className="text-slate-700 dark:text-slate-200">{lead.company_name || lead.contact_person}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Interaction Type Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Follow-up Channel / Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {followUpTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    type === item.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label htmlFor="followup-datetime" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date &amp; Scheduled Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                id="followup-datetime"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Follow-up Objective / Note */}
          <div>
            <label htmlFor="followup-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Follow-up Objective / Agenda
            </label>
            <textarea
              id="followup-notes"
              rows={2}
              placeholder="e.g. Discuss load survey calculations, verify acoustic foundation, confirm delivery date..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-all"
            >
              {isSubmitting ? 'Scheduling...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
