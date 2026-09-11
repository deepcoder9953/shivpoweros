import React from 'react';
import { Lead, LeadStatus, TeamMember } from '../../types/lead';
import { LeadTableRow } from './LeadTableRow';
import { LeadCard } from './LeadCard';
import { Inbox, UserPlus } from 'lucide-react';

interface LeadListProps {
  leads?: Lead[];
  viewMode: 'table' | 'grid';
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onQuickFollowUp: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onAssignChange: (leadId: string, assignedTo: string) => void;
  teamMembers: TeamMember[];
  onOpenAddModal: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  leads = [],
  viewMode,
  onView,
  onEdit,
  onDelete,
  onQuickFollowUp,
  onStatusChange,
  onAssignChange,
  teamMembers,
  onOpenAddModal,
  hasActiveFilters,
  onResetFilters,
}) => {
  const safeLeads = leads || [];

  if (safeLeads.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No leads found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
          {hasActiveFilters
            ? 'No leads matched your current search and filter criteria. Try adjusting or clearing your filters.'
            : 'Your lead registry is currently empty. Start capturing incoming inquiries from website, direct calls, or field surveys.'}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Your First Lead</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile always renders responsive cards when on phone screens (< md)
  return (
    <>
      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {safeLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickFollowUp={onQuickFollowUp}
            onStatusChange={onStatusChange}
            teamMembers={teamMembers}
          />
        ))}
      </div>

      {/* Desktop & Tablet Table or Grid View (>= md) */}
      <div className="hidden md:block">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {safeLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickFollowUp={onQuickFollowUp}
                onStatusChange={onStatusChange}
                teamMembers={teamMembers}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table id="leads-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Lead Score</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {safeLeads.map((lead) => (
                    <LeadTableRow
                      key={lead.id}
                      lead={lead}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onQuickFollowUp={onQuickFollowUp}
                      onStatusChange={onStatusChange}
                      onAssignChange={onAssignChange}
                      teamMembers={teamMembers}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
