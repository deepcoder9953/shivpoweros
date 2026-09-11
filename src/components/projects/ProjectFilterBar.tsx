import React, { useState } from 'react';
import { Customer } from '../../types/customer';
import { TeamMember } from '../../types/lead';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '../../types/project';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  Calendar,
  User,
  Building2,
  Check,
} from 'lucide-react';

export interface ProjectFilterState {
  searchQuery: string;
  status: string; // 'all' | ProjectStatus
  customerId: string; // 'all' | customerId
  assignedTo: string; // 'all' | user
  startDateFrom: string;
  expectedCompletionTo: string;
  sortBy: 'project_name' | 'customer' | 'budget' | 'start_date' | 'expected_completion' | 'status' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

interface ProjectFilterBarProps {
  filters: ProjectFilterState;
  onApplyFilters: (filters: ProjectFilterState) => void;
  onResetFilters: () => void;
  customers: Customer[];
  teamMembers: TeamMember[];
  totalResults: number;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  customers,
  teamMembers,
  totalResults,
}) => {
  const [localFilters, setLocalFilters] = useState<ProjectFilterState>(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Synchronize when parent reset happens
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const defaultFilters: ProjectFilterState = {
      searchQuery: '',
      status: 'all',
      customerId: 'all',
      assignedTo: 'all',
      startDateFrom: '',
      expectedCompletionTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
    setLocalFilters(defaultFilters);
    onResetFilters();
  };

  const isFiltered =
    Boolean(localFilters.searchQuery.trim()) ||
    localFilters.status !== 'all' ||
    localFilters.customerId !== 'all' ||
    localFilters.assignedTo !== 'all' ||
    Boolean(localFilters.startDateFrom) ||
    Boolean(localFilters.expectedCompletionTo) ||
    localFilters.sortBy !== 'created_at' ||
    localFilters.sortOrder !== 'desc';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 space-y-3 transition-colors">
      {/* Primary Row: Search & Quick Status Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-project-search"
            type="text"
            placeholder="Search projects by name, client, description..."
            value={localFilters.searchQuery}
            onChange={(e) => {
              const updated = { ...localFilters, searchQuery: e.target.value };
              setLocalFilters(updated);
              onApplyFilters(updated);
            }}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
          {localFilters.searchQuery && (
            <button
              type="button"
              onClick={() => {
                const updated = { ...localFilters, searchQuery: '' };
                setLocalFilters(updated);
                onApplyFilters(updated);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Status Pill Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              const updated = { ...localFilters, status: 'all' };
              setLocalFilters(updated);
              onApplyFilters(updated);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              localFilters.status === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Statuses
          </button>
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((st) => {
            const isSelected = localFilters.status === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  const updated = { ...localFilters, status: st };
                  setLocalFilters(updated);
                  onApplyFilters(updated);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {PROJECT_STATUS_LABELS[st]}
              </button>
            );
          })}
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          id="btn-toggle-advanced-filters"
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            isAdvancedOpen || isFiltered
              ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters &amp; Sort</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          )}
        </button>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {isAdvancedOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Customer Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>Customer</span>
            </label>
            <select
              id="select-filter-customer"
              value={localFilters.customerId}
              onChange={(e) => setLocalFilters({ ...localFilters, customerId: e.target.value })}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} {c.contact_person ? `(${c.contact_person})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Assigned Member</span>
            </label>
            <select
              id="select-filter-assigned-to"
              value={localFilters.assignedTo}
              onChange={(e) => setLocalFilters({ ...localFilters, assignedTo: e.target.value })}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Team Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date From Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Start Date (From)</span>
            </label>
            <input
              id="input-filter-start-date"
              type="date"
              value={localFilters.startDateFrom}
              onChange={(e) => setLocalFilters({ ...localFilters, startDateFrom: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Expected Completion To Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Expected Completion (To)</span>
            </label>
            <input
              id="input-filter-expected-completion"
              type="date"
              value={localFilters.expectedCompletionTo}
              onChange={(e) => setLocalFilters({ ...localFilters, expectedCompletionTo: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Sort Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>Sort By</span>
            </label>
            <select
              id="select-filter-sort-by"
              value={localFilters.sortBy}
              onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value as any })}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="created_at">Date Created</option>
              <option value="project_name">Project Name</option>
              <option value="customer">Customer</option>
              <option value="budget">Project Budget</option>
              <option value="start_date">Start Date</option>
              <option value="expected_completion">Expected Completion</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Order</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, sortOrder: 'asc' })}
                className={`flex-1 text-xs py-2 px-2 rounded-lg font-semibold border ${
                  localFilters.sortOrder === 'asc'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Ascending
              </button>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, sortOrder: 'desc' })}
                className={`flex-1 text-xs py-2 px-2 rounded-lg font-semibold border ${
                  localFilters.sortOrder === 'desc'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Descending
              </button>
            </div>
          </div>

          {/* Apply & Clear Buttons */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-2 pt-2">
            <button
              id="btn-apply-filters"
              type="button"
              onClick={handleApply}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
            <button
              id="btn-clear-filters"
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Results Summary Badge */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{totalResults}</strong> matching project{totalResults === 1 ? '' : 's'}
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline text-xs"
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
