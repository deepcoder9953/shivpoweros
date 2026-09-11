import React, { useState } from 'react';
import { FollowupRecord, FollowupFormData, FollowupType, FollowupStatus } from '../../types/followup';
import { Lead, TeamMember } from '../../types/lead';
import { Customer } from '../../types/customer';
import { FollowupFormModal } from './FollowupFormModal';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  Mail,
  Building2,
  User,
  Check,
} from 'lucide-react';

interface FollowupManagementProps {
  followups?: FollowupRecord[];
  leads?: Lead[];
  customers?: Customer[];
  teamMembers?: TeamMember[];
  onCreateFollowup: (data: FollowupFormData) => Promise<boolean>;
  onUpdateFollowup: (id: string, data: Partial<FollowupFormData>) => Promise<boolean>;
  onCompleteFollowup: (id: string, notes?: string) => Promise<boolean>;
  onDeleteFollowup: (id: string) => Promise<boolean>;
  onViewLead?: (lead: Lead) => void;
  onViewCustomer?: (customer: Customer) => void;
}

export const FollowupManagement: React.FC<FollowupManagementProps> = ({
  followups = [],
  leads = [],
  customers = [],
  teamMembers = [],
  onCreateFollowup,
  onUpdateFollowup,
  onCompleteFollowup,
  onDeleteFollowup,
  onViewLead,
  onViewCustomer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<FollowupRecord | null>(null);

  // Complete modal state
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const safeFollowups = followups || [];

  // Dates categorization
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const getFilteredFollowups = () => {
    return safeFollowups.filter((f) => {
      // Channel type filter
      if (typeFilter !== 'all' && f.followup_type !== typeFilter) return false;

      const fDate = new Date(f.followup_date);

      if (activeSubTab === 'completed') {
        return f.status === 'Completed';
      }

      if (f.status === 'Completed') return false;

      if (activeSubTab === 'today') {
        return fDate >= todayStart && fDate <= todayEnd;
      }
      if (activeSubTab === 'overdue') {
        return fDate < todayStart;
      }
      if (activeSubTab === 'upcoming') {
        return fDate > todayEnd;
      }
      return true; // 'all'
    });
  };

  const todayCount = safeFollowups.filter((f) => {
    const fDate = new Date(f.followup_date);
    return f.status === 'Pending' && fDate >= todayStart && fDate <= todayEnd;
  }).length;

  const overdueCount = safeFollowups.filter((f) => {
    const fDate = new Date(f.followup_date);
    return f.status === 'Pending' && fDate < todayStart;
  }).length;

  const upcomingCount = safeFollowups.filter((f) => {
    const fDate = new Date(f.followup_date);
    return f.status === 'Pending' && fDate > todayEnd;
  }).length;

  const completedCount = safeFollowups.filter((f) => f.status === 'Completed').length;

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingId) return;
    setIsCompleting(true);
    try {
      const ok = await onCompleteFollowup(completingId, completionNotes);
      if (ok) {
        setCompletingId(null);
        setCompletionNotes('');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const filteredItems = getFilteredFollowups();

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Follow-up &amp; Communication Schedule</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of client call commitments, quotation discussions, and physical site inspections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingFollowup(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Follow-up</span>
        </button>
      </div>

      {/* Sub tabs and channel filter */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Tabs: Today, Overdue, Upcoming, Completed, All */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'today'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Today's Follow-ups</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                activeSubTab === 'today' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                  activeSubTab === 'overdue' ? 'bg-rose-700 text-white' : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200'
                }`}
              >
                {overdueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Upcoming</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                activeSubTab === 'upcoming' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                activeSubTab === 'completed' ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Follow-ups
          </button>
        </div>

        {/* Channel selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Channel:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden text-xs bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">All Channels</option>
            <option value="Call">Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Visit">Site Visit</option>
          </select>
        </div>
      </div>

      {/* Follow-up Cards / List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 transition-colors">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No follow-ups in this view</p>
            <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
              Click "+ Schedule Follow-up" to add a reminder or review other tabs.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const fDate = new Date(item.followup_date);
            const isOverdue = item.status === 'Pending' && fDate < todayStart;
            const isToday = item.status === 'Pending' && fDate >= todayStart && fDate <= todayEnd;

            // Link targets
            const lead = item.lead_id ? leads.find((l) => l.id === item.lead_id) : null;
            const customer = item.customer_id ? customers.find((c) => c.id === item.customer_id) : null;

            return (
              <div
                key={item.id}
                id={`followup-item-${item.id}`}
                className={`p-4 rounded-2xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isOverdue
                    ? 'border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20'
                    : isToday
                    ? 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Icon indicator */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      item.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : isOverdue
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : isToday
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {item.followup_type === 'Call' && <Phone className="w-4 h-4" />}
                    {item.followup_type === 'WhatsApp' && <MessageSquare className="w-4 h-4" />}
                    {item.followup_type === 'Email' && <Mail className="w-4 h-4" />}
                    {item.followup_type === 'Visit' && <Building2 className="w-4 h-4" />}
                    {item.followup_type !== 'Call' &&
                      item.followup_type !== 'WhatsApp' &&
                      item.followup_type !== 'Email' &&
                      item.followup_type !== 'Visit' && <Clock className="w-4 h-4" />}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.subject || `${item.followup_type} Discussion`}
                      </h4>

                      <span
                        className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : isToday
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.status === 'Completed' ? 'Completed' : isOverdue ? 'Overdue' : isToday ? 'Today' : 'Upcoming'}
                      </span>

                      <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.followup_type}
                      </span>
                    </div>

                    {/* Linked entity */}
                    <div className="mt-1 flex items-center gap-2 text-2xs sm:text-xs text-slate-600 dark:text-slate-400 flex-wrap">
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
                      {!lead && !customer && (item.lead_name || item.customer_name) && (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.lead_name || item.customer_name}</span>
                      )}

                      <span className="text-slate-400 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {fDate.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {fDate.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span className="text-slate-400 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400">Assigned: {item.assigned_to || 'Unassigned'}</span>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {item.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => setCompletingId(item.id)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingFollowup(item);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    title="Edit / Reschedule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteFollowup(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Follow-up"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule / Edit Modal */}
      <FollowupFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFollowup(null);
        }}
        onSubmit={async (data) => {
          if (editingFollowup) {
            return onUpdateFollowup(editingFollowup.id, data);
          } else {
            return onCreateFollowup(data);
          }
        }}
        initialData={editingFollowup}
        leads={leads}
        customers={customers}
        teamMembers={teamMembers}
      />

      {/* Complete Follow-up Dialog */}
      {completingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Mark Follow-up as Completed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add outcome notes or client feedback from the call/visit to log into the activity history.
            </p>

            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Discussed AMF panel price. Customer agreed to 10% advance tomorrow."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {isCompleting ? 'Saving...' : 'Confirm Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
