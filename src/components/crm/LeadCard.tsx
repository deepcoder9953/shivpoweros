import React from 'react';
import { Lead, LeadStatus, TeamMember } from '../../types/lead';
import { StatusBadge, SourceBadge, ScoreBadge } from '../ui/Badge';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarPlus,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onQuickFollowUp: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  teamMembers?: TeamMember[];
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onView,
  onEdit,
  onDelete,
  onQuickFollowUp,
}) => {
  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

  return (
    <div
      id={`lead-card-${lead.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Source and Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <SourceBadge source={lead.lead_source} />
          <StatusBadge status={lead.status} />
        </div>

        {/* Company & Contact */}
        <div className="mb-3">
          <h3
            onClick={() => onView(lead)}
            className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{lead.company_name || 'Individual Inquiry'}</span>
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{lead.contact_person || 'No contact person specified'}</span>
          </div>
        </div>

        {/* Requirement Snippet */}
        {lead.requirement && (
          <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
            <strong className="text-slate-900 dark:text-slate-100 font-medium">Req: </strong>
            {lead.requirement}
          </div>
        )}

        {/* Quick Contact & Details list */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-mono">
                {lead.phone}
              </a>
            </div>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {lead.location && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{lead.location}</span>
            </div>
          )}

          {lead.email && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <a href={`mailto:${lead.email}`} className="truncate hover:text-blue-600 dark:hover:text-blue-400">
                {lead.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Score & Action buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <ScoreBadge score={lead.lead_score} />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onQuickFollowUp(lead)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            title="Schedule Follow-up"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onView(lead)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
            title="Edit Lead"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
