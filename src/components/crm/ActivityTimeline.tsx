import React, { useState } from 'react';
import { ActivityRecord } from '../../types/activity';
import { Lead } from '../../types/lead';
import { Customer } from '../../types/customer';
import {
  History,
  Activity,
  UserPlus,
  UserCheck,
  CalendarPlus,
  CheckCircle2,
  FileText,
  Building2,
  User,
  Search,
  Filter,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities?: ActivityRecord[];
  leads?: Lead[];
  customers?: Customer[];
  onViewLead?: (lead: Lead) => void;
  onViewCustomer?: (customer: Customer) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities = [],
  leads = [],
  customers = [],
  onViewLead,
  onViewCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const safeActivities = activities || [];

  const filteredActivities = safeActivities.filter((act) => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchText =
        act.action?.toLowerCase().includes(term) ||
        act.description?.toLowerCase().includes(term) ||
        act.performed_by?.toLowerCase().includes(term);
      if (!matchText) return false;
    }

    // Action filter
    if (actionFilter !== 'all') {
      if (!act.action?.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    }

    return true;
  });

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('created') || act.includes('added')) {
      return <UserPlus className="w-4 h-4 text-blue-600" />;
    }
    if (act.includes('converted') || act.includes('won')) {
      return <UserCheck className="w-4 h-4 text-emerald-600" />;
    }
    if (act.includes('follow-up') || act.includes('followup')) {
      return <CalendarPlus className="w-4 h-4 text-amber-600" />;
    }
    if (act.includes('completed') || act.includes('done')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (act.includes('note')) {
      return <FileText className="w-4 h-4 text-indigo-600" />;
    }
    return <Activity className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">CRM Audit & Activity History</h2>
          <p className="text-xs text-slate-500">
            Chronological audit trail of all lead conversions, customer updates, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {activities.length} Total Logged Events
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities, descriptions, or users..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Event Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden text-xs bg-slate-50"
          >
            <option value="all">All Events</option>
            <option value="Lead">Lead Events</option>
            <option value="Customer">Customer Events</option>
            <option value="Converted">Conversions</option>
            <option value="Follow-up">Follow-ups</option>
            <option value="Note">Notes</option>
          </select>
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No activity records found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Actions are recorded automatically whenever you add leads, update pipeline stages, or schedule follow-ups.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {filteredActivities.map((act) => {
              const lead = act.lead_id ? leads.find((l) => l.id === act.lead_id) : null;
              const customer = act.customer_id ? customers.find((c) => c.id === act.customer_id) : null;
              const actDate = new Date(act.created_at);

              return (
                <div key={act.id} className="relative pl-6 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center transition-colors shadow-2xs">
                    {getActionIcon(act.action)}
                  </div>

                  <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-colors">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.action}</span>
                        {act.performed_by && (
                          <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            by {act.performed_by}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {actDate.toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at {actDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{act.description}</p>

                    {/* Linked entity chips */}
                    {(lead || customer) && (
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 text-xs">
                        {lead && (
                          <button
                            type="button"
                            onClick={() => onViewLead && onViewLead(lead)}
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            <User className="w-3 h-3" />
                            <span>Lead: {lead.company_name || lead.contact_person}</span>
                          </button>
                        )}
                        {customer && (
                          <button
                            type="button"
                            onClick={() => onViewCustomer && onViewCustomer(customer)}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            <Building2 className="w-3 h-3" />
                            <span>Customer: {customer.company_name || customer.contact_person}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
