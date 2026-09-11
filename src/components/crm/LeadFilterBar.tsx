import React from 'react';
import { Search, RotateCcw, LayoutGrid, LayoutList } from 'lucide-react';
import { LeadStatus, LeadSource } from '../../types/lead';

interface FilterState {
  search: string;
  status: string;
  source: string;
  industry: string;
  scoreRange: string;
}

interface LeadFilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalLeads: number;
  viewMode: 'table' | 'grid';
  onToggleViewMode: (mode: 'table' | 'grid') => void;
  industries: string[];
}

export const STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const SOURCE_OPTIONS: LeadSource[] = [
  'JustDial',
  'Website',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Google',
  'Referral',
  'Cold Outreach',
  'Other',
];

export const LeadFilterBar: React.FC<LeadFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalLeads,
  viewMode,
  onToggleViewMode,
  industries,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.source !== 'all' ||
    filters.industry !== 'all' ||
    filters.scoreRange !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-5 space-y-3">
      {/* Top row: Search and View Mode Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            id="lead-search-input"
            type="text"
            placeholder="Search by company, contact, phone, email..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-14 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {/* View toggle & count */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Showing <strong className="text-slate-900 dark:text-slate-100 font-bold">{totalFiltered}</strong> of {totalLeads}
          </span>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        {/* Status Filter */}
        <div>
          <label htmlFor="filter-status" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label htmlFor="filter-source" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Source
          </label>
          <select
            id="filter-source"
            value={filters.source}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            {SOURCE_OPTIONS.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Industry Filter */}
        <div>
          <label htmlFor="filter-industry" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Industry
          </label>
          <select
            id="filter-industry"
            value={filters.industry}
            onChange={(e) => onFilterChange('industry', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Score Filter */}
        <div>
          <label htmlFor="filter-score" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Lead Score
          </label>
          <select
            id="filter-score"
            value={filters.scoreRange}
            onChange={(e) => onFilterChange('scoreRange', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Scores</option>
            <option value="hot">Hot (80 – 100 🔥)</option>
            <option value="warm">Warm (70 – 79)</option>
            <option value="cold">Cold (40 – 69)</option>
            <option value="low">Low (0 – 39)</option>
          </select>
        </div>

        {/* Clear Filters CTA */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
