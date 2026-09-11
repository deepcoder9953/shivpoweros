import React, { useState } from 'react';
import { Lead, LeadStatus, TeamMember } from '../../types/lead';
import { StatusBadge, SourceBadge, ScoreBadge } from '../ui/Badge';
import {
  Eye,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  CalendarPlus,
  MapPin,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { STATUS_OPTIONS } from './LeadFilterBar';

interface LeadTableRowProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onQuickFollowUp: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onAssignChange: (leadId: string, assignedTo: string) => void;
  teamMembers: TeamMember[];
}

export const LeadTableRow: React.FC<LeadTableRowProps> = ({
  lead,
  onView,
  onEdit,
  onDelete,
  onQuickFollowUp,
  onStatusChange,
  onAssignChange,
  teamMembers,
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const formattedDate = new Date(lead.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

  return (
    <tr
      id={`lead-row-${lead.id}`}
      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200/70 dark:border-slate-800 group text-slate-800 dark:text-slate-200"
    >
      {/* 1. Company */}
      <td className="py-3.5 px-4">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <button
              onClick={() => onView(lead)}
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate block max-w-[200px]"
              title={lead.company_name || 'Individual Inquiry'}
            >
              {lead.company_name || 'Individual Inquiry'}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
              {lead.industry || 'Industrial'}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Contact Person */}
      <td className="py-3.5 px-4">
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{lead.contact_person || '—'}</div>
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block max-w-[170px]"
            title={lead.email}
          >
            {lead.email}
          </a>
        )}
      </td>

      {/* 3. Phone & Quick Channels */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-mono flex items-center gap-1"
            title="Call"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {lead.phone}
          </a>
          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                `Hello ${lead.contact_person || ''}, regarding your power solution inquiry for Shiv Power Solution...`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              title="Message on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </td>

      {/* 4. Location */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={lead.location}>
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{lead.location || '—'}</span>
        </div>
      </td>

      {/* 5. Source */}
      <td className="py-3.5 px-4">
        <SourceBadge source={lead.lead_source} />
      </td>

      {/* 6. Status with Dropdown */}
      <td className="py-3.5 px-4">
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1 group/btn focus:outline-hidden"
          >
            <StatusBadge status={lead.status} />
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-200" />
          </button>

          {showStatusDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowStatusDropdown(false)}
              />
              <div className="origin-top-left absolute left-0 mt-1 w-44 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10 z-30 py-1 divide-y divide-slate-100 dark:divide-slate-700">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Update Lead Stage
                </div>
                <div className="py-1">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onStatusChange(lead.id, st);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${
                        lead.status === st ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{st}</span>
                      {lead.status === st && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </td>

      {/* 7. AI Score */}
      <td className="py-3.5 px-4">
        <ScoreBadge score={lead.lead_score} />
      </td>

      {/* 8. Assigned To */}
      <td className="py-3.5 px-4">
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setShowAssignDropdown(!showAssignDropdown)}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-hidden"
          >
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
              {(lead.assigned_to || 'U')[0]}
            </div>
            <span className="truncate max-w-[100px]">{lead.assigned_to || 'Unassigned'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showAssignDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowAssignDropdown(false)}
              />
              <div className="origin-top-left absolute left-0 mt-1 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10 z-30 py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Assign Sales Engineer
                </div>
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      onAssignChange(lead.id, member.name);
                      setShowAssignDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col ${
                      lead.assigned_to === member.name ? 'bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{member.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{member.role}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </td>

      {/* 9. Created Date */}
      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formattedDate}
      </td>

      {/* 10. Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Quick Follow-up */}
          <button
            type="button"
            onClick={() => onQuickFollowUp(lead)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            title="Schedule Follow-up"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>

          {/* View Details */}
          <button
            type="button"
            onClick={() => onView(lead)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
            title="Edit Lead"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(lead)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
