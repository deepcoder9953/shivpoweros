import React, { useState } from 'react';
import { Lead, LeadStatus } from '../../types/lead';
import { ScoreBadge, SourceBadge } from '../ui/Badge';
import {
  Building2,
  User,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  CalendarPlus,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface SalesPipelineProps {
  leads?: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<boolean> | void;
  onViewLead: (lead: Lead) => void;
  onScheduleFollowup: (lead: Lead) => void;
  onConvertToCustomer: (lead: Lead) => void;
  onAddNewLead?: () => void;
}

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string; border: string; bg: string; dot: string }[] = [
  { id: 'New', label: 'New', color: 'text-sky-700', border: 'border-sky-200', bg: 'bg-sky-50/50', dot: 'bg-sky-500' },
  { id: 'Contacted', label: 'Contacted', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/50', dot: 'bg-blue-500' },
  { id: 'Qualified', label: 'Qualified', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/50', dot: 'bg-amber-500' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50/50', dot: 'bg-purple-500' },
  { id: 'Negotiation', label: 'Negotiation', color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50/50', dot: 'bg-indigo-500' },
  { id: 'Won', label: 'Won', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50', dot: 'bg-emerald-500' },
  { id: 'Lost', label: 'Lost', color: 'text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50/50', dot: 'bg-rose-500' },
];

export const SalesPipeline: React.FC<SalesPipelineProps> = ({
  leads = [],
  onStatusChange,
  onViewLead,
  onScheduleFollowup,
  onConvertToCustomer,
  onAddNewLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const safeLeads = leads || [];

  const filteredLeads = safeLeads.filter((lead) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lead.company_name?.toLowerCase().includes(term) ||
      lead.contact_person?.toLowerCase().includes(term) ||
      lead.phone?.toLowerCase().includes(term) ||
      lead.assigned_to?.toLowerCase().includes(term)
    );
  });

  const getStageLeads = (stage: LeadStatus) => {
    return filteredLeads.filter((l) => l.status === stage);
  };

  const handleMove = async (lead: Lead, direction: 'prev' | 'next') => {
    const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === lead.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= PIPELINE_STAGES.length) return;

    const newStage = PIPELINE_STAGES[nextIndex].id;
    setUpdatingId(lead.id);
    try {
      await onStatusChange(lead.id, newStage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStageSelect = async (leadId: string, newStage: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await onStatusChange(leadId, newStage);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Sales Pipeline Board</h2>
          <p className="text-xs text-slate-500">
            Track inquiries through the 7-stage power system sales workflow from initial inquiry to deal won.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact, or assignee..."
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Horizontal Scrolling Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
        {PIPELINE_STAGES.map((stage, idx) => {
          const stageLeads = getStageLeads(stage.id);

          return (
            <div
              key={stage.id}
              id={`pipeline-column-${stage.id.toLowerCase().replace(/\s+/g, '-')}`}
              className="w-76 shrink-0 flex flex-col rounded-2xl bg-slate-100/80 border border-slate-200/80 max-h-[calc(100vh-230px)]"
            >
              {/* Column Header */}
              <div className="p-3 bg-white rounded-t-2xl border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                    const isUpdating = updatingId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        id={`pipeline-card-${lead.id}`}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                          isUpdating ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <div>
                          {/* Top: Source and Score */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <SourceBadge source={lead.lead_source} />
                            <ScoreBadge score={lead.lead_score} />
                          </div>

                          {/* Company Name */}
                          <h4
                            onClick={() => onViewLead(lead)}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.company_name || 'Individual Inquiry'}</span>
                          </h4>

                          {/* Contact Person */}
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.contact_person || 'No contact'}</span>
                          </div>

                          {/* Requirement Snippet */}
                          {lead.requirement && (
                            <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                              {lead.requirement}
                            </p>
                          )}

                          {/* Phone & WhatsApp */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-medium"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WA</span>
                              </a>
                            )}
                          </div>

                          {/* Assignee */}
                          <div className="mt-1.5 text-[10px] text-slate-400 truncate">
                            Assigned: <span className="text-slate-600 font-medium">{lead.assigned_to || 'Unassigned'}</span>
                          </div>
                        </div>

                        {/* Card Footer: Quick Move and Actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Quick stage selector */}
                          <select
                            value={lead.status}
                            onChange={(e) => handleStageSelect(lead.id, e.target.value as LeadStatus)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-hidden"
                            title="Move Stage"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-0.5">
                            {/* Schedule Follow-up */}
                            <button
                              type="button"
                              onClick={() => onScheduleFollowup(lead)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Schedule Follow-up"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                            </button>

                            {/* Convert to Customer */}
                            <button
                              type="button"
                              onClick={() => onConvertToCustomer(lead)}
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Convert to Customer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => onViewLead(lead)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="View Lead Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
