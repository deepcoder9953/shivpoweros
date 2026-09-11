import React from 'react';
import {
  Bell,
  X,
  Clock,
  Flame,
  FileText,
  CheckSquare,
  AlertTriangle,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { FollowupRecord } from '../../types/followup';
import { Lead } from '../../types/lead';
import { Quotation, formatINR, isQuotationExpired } from '../../types/quotation';
import { Task } from '../../types/task';
import { CRMTab } from '../crm/CRMNavigation';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  followups?: FollowupRecord[];
  leads?: Lead[];
  quotations?: Quotation[];
  tasks?: Task[];
  onNavigateTab: (tab: CRMTab) => void;
  onViewLead?: (lead: Lead) => void;
  onViewQuotation?: (quotation: Quotation) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  followups = [],
  leads = [],
  quotations = [],
  tasks = [],
  onNavigateTab,
  onViewLead,
  onViewQuotation,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // 1. Overdue followups
  const overdueFollowups = followups.filter((f) => {
    if (f.status === 'Completed' || f.status === 'Cancelled') return false;
    const d = new Date(f.followup_date);
    return d < todayStart;
  });

  // 2. Due today followups
  const dueTodayFollowups = followups.filter((f) => {
    if (f.status === 'Completed' || f.status === 'Cancelled') return false;
    const d = new Date(f.followup_date);
    return d >= todayStart && d <= todayEnd;
  });

  // 3. Hot leads needing attention (score >= 80, status New/Contacted)
  const hotLeadsNeedingAction = leads.filter(
    (l) => l.lead_score >= 80 && (l.status === 'New' || l.status === 'Contacted')
  );

  // 4. Quotations awaiting acceptance or expiring
  const activeQuotes = quotations.filter((q) => {
    const s = (q.status || '').toLowerCase();
    return s === 'sent' || s === 'viewed' || s === 'negotiation';
  });

  // 5. Urgent tasks
  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Completed'
  );

  const totalAlerts =
    overdueFollowups.length +
    dueTodayFollowups.length +
    hotLeadsNeedingAction.length +
    activeQuotes.length +
    urgentTasks.length;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-2xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="notification-drawer-panel"
        className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Action Center &amp; Notifications
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalAlerts} active item{totalAlerts === 1 ? '' : 's'} require attention
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {totalAlerts === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-xs mt-1">No overdue follow-ups or critical alerts at this moment.</p>
            </div>
          ) : (
            <>
              {/* Overdue Follow-ups */}
              {overdueFollowups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overdue Follow-ups ({overdueFollowups.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('followups');
                        onClose();
                      }}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  {overdueFollowups.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {f.subject}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                          Overdue
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Date: {new Date(f.followup_date).toLocaleDateString('en-IN')} · Type: {f.followup_type}
                      </p>
                      <div className="pt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateTab('followups');
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                        >
                          Take Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Today's Follow-ups */}
              {dueTodayFollowups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Due Today ({dueTodayFollowups.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('followups');
                        onClose();
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  {dueTodayFollowups.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {f.subject}
                        </h4>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                          {f.followup_time || 'Today'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Type: {f.followup_type} · Assigned: {f.assigned_to || 'You'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hot Leads */}
              {hotLeadsNeedingAction.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                      Hot Leads Requiring Action ({hotLeadsNeedingAction.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('leads');
                        onClose();
                      }}
                      className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View leads
                    </button>
                  </div>
                  {hotLeadsNeedingAction.slice(0, 3).map((lead) => {
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {lead.company_name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {lead.contact_person} · Score {lead.lead_score}/100
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-200">
                            🔥 Hot
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewLead) onViewLead(lead);
                              else onNavigateTab('leads');
                              onClose();
                            }}
                            className="ml-auto text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-0.5"
                          >
                            Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quotations awaiting response */}
              {activeQuotes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Pending Quotations ({activeQuotes.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('quotations');
                        onClose();
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  {activeQuotes.slice(0, 3).map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                          {q.quotation_number}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatINR(q.total)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {q.customer?.company_name || q.customer_name} ({q.status})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
