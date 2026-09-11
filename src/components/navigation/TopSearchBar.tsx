import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Users,
  Building2,
  FileText,
  FolderKanban,
  CheckSquare,
  ArrowRight,
  Flame,
  CornerDownLeft,
} from 'lucide-react';
import { Lead } from '../../types/lead';
import { Customer } from '../../types/customer';
import { Quotation, formatINR } from '../../types/quotation';
import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { CRMTab } from '../crm/CRMNavigation';

export interface TopSearchBarProps {
  onOpenFullModal: () => void;
  onNavigateTab: (tab: CRMTab) => void;
  leads?: Lead[];
  customers?: Customer[];
  quotations?: Quotation[];
  projects?: Project[];
  tasks?: Task[];
  onSelectLead?: (lead: Lead) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectQuotation?: (quotation: Quotation) => void;
  onSelectProject?: (project: Project) => void;
}

type SearchItem =
  | { type: 'lead'; item: Lead }
  | { type: 'customer'; item: Customer }
  | { type: 'quotation'; item: Quotation }
  | { type: 'project'; item: Project }
  | { type: 'task'; item: Task };

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  onOpenFullModal,
  onNavigateTab,
  leads = [],
  customers = [],
  quotations = [],
  projects = [],
  tasks = [],
  onSelectLead,
  onSelectCustomer,
  onSelectQuotation,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: ⌘K or Ctrl+K focuses the input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matches
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { leads: [], customers: [], quotations: [], projects: [], tasks: [], total: 0 };
    }

    const matchedLeads = leads
      .filter(
        (l) =>
          l.company_name?.toLowerCase().includes(q) ||
          l.contact_person?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.requirement?.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedCustomers = customers
      .filter(
        (c) =>
          c.company_name?.toLowerCase().includes(q) ||
          c.contact_person?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedQuotations = quotations
      .filter(
        (quot) =>
          quot.quotation_number?.toLowerCase().includes(q) ||
          quot.title?.toLowerCase().includes(q) ||
          quot.customer_name?.toLowerCase().includes(q) ||
          quot.customer?.company_name?.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedProjects = projects
      .filter(
        (p) =>
          p.project_name?.toLowerCase().includes(q) ||
          p.customer_name?.toLowerCase().includes(q) ||
          p.assigned_to?.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const matchedTasks = tasks
      .filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.assigned_to?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
      .slice(0, 3);

    const total =
      matchedLeads.length +
      matchedCustomers.length +
      matchedQuotations.length +
      matchedProjects.length +
      matchedTasks.length;

    return {
      leads: matchedLeads,
      customers: matchedCustomers,
      quotations: matchedQuotations,
      projects: matchedProjects,
      tasks: matchedTasks,
      total,
    };
  }, [query, leads, customers, quotations, projects, tasks]);

  // Flatten items for keyboard navigation
  const flatItems = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [];
    filtered.leads.forEach((l) => list.push({ type: 'lead', item: l }));
    filtered.customers.forEach((c) => list.push({ type: 'customer', item: c }));
    filtered.quotations.forEach((q) => list.push({ type: 'quotation', item: q }));
    filtered.projects.forEach((p) => list.push({ type: 'project', item: p }));
    filtered.tasks.forEach((t) => list.push({ type: 'task', item: t }));
    return list;
  }, [filtered]);

  // Handle selection of an item
  const handleSelectItem = (entry: SearchItem) => {
    setIsFocused(false);
    setActiveIndex(-1);
    setQuery('');

    switch (entry.type) {
      case 'lead':
        if (onSelectLead) onSelectLead(entry.item);
        else onNavigateTab('leads');
        break;
      case 'customer':
        if (onSelectCustomer) onSelectCustomer(entry.item);
        else onNavigateTab('customers');
        break;
      case 'quotation':
        if (onSelectQuotation) onSelectQuotation(entry.item);
        else onNavigateTab('quotations');
        break;
      case 'project':
        if (onSelectProject) onSelectProject(entry.item);
        else onNavigateTab('projects');
        break;
      case 'task':
        onNavigateTab('tasks');
        break;
    }
  };

  // Keyboard navigation inside the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (flatItems.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onOpenFullModal();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        handleSelectItem(flatItems[activeIndex]);
      } else {
        onOpenFullModal();
      }
    }
  };

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center w-full rounded-xl border transition-all duration-150 bg-slate-50/90 dark:bg-slate-800/80 ${
          isFocused
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <Search
          className={`w-4 h-4 ml-3 shrink-0 transition-colors ${
            isFocused ? 'text-blue-500' : 'text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          id="top-global-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search leads, clients, quotes, projects..."
          className="w-full py-1.5 pl-2.5 pr-14 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Right side controls: Clear X or ⌘K badge */}
        <div className="absolute right-2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 pointer-events-none select-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Results Dropdown */}
      {showDropdown && (
        <div
          id="top-search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-left"
        >
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1.5">
            {filtered.total === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  No records matching <strong className="text-slate-900 dark:text-slate-100">"{query}"</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    onOpenFullModal();
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Open Full Search Directory ↵
                </button>
              </div>
            ) : (
              <>
                {/* 1. Leads */}
                {filtered.leads.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" /> Leads
                      </span>
                      <span>{filtered.leads.length}</span>
                    </div>
                    {filtered.leads.map((lead) => {
                      const idx = flatItems.findIndex((x) => x.type === 'lead' && (x.item as Lead).id === lead.id);
                      const isSelected = activeIndex === idx;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => handleSelectItem({ type: 'lead', item: lead })}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                                {lead.company_name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium">
                                {lead.status}
                              </span>
                              {lead.lead_score >= 80 && (
                                <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 fill-orange-500" /> {lead.lead_score}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {lead.contact_person} · {lead.phone}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Customers */}
                {filtered.customers.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-cyan-500" /> Customers
                      </span>
                      <span>{filtered.customers.length}</span>
                    </div>
                    {filtered.customers.map((cust) => {
                      const idx = flatItems.findIndex((x) => x.type === 'customer' && (x.item as Customer).id === cust.id);
                      const isSelected = activeIndex === idx;
                      return (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectItem({ type: 'customer', item: cust })}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                                {cust.company_name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 font-medium">
                                {cust.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {cust.contact_person} {cust.city ? `· ${cust.city}` : ''}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Quotations */}
                {filtered.quotations.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-500" /> Quotations
                      </span>
                      <span>{filtered.quotations.length}</span>
                    </div>
                    {filtered.quotations.map((quot) => {
                      const idx = flatItems.findIndex((x) => x.type === 'quotation' && (x.item as Quotation).id === quot.id);
                      const isSelected = activeIndex === idx;
                      return (
                        <div
                          key={quot.id}
                          onClick={() => handleSelectItem({ type: 'quotation', item: quot })}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                                {quot.title || quot.quotation_number}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium">
                                {quot.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {quot.customer_name} · <strong className="text-slate-800 dark:text-slate-200">{formatINR(quot.total)}</strong>
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. Projects */}
                {filtered.projects.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3 text-emerald-500" /> Projects
                      </span>
                      <span>{filtered.projects.length}</span>
                    </div>
                    {filtered.projects.map((proj) => {
                      const idx = flatItems.findIndex((x) => x.type === 'project' && (x.item as Project).id === proj.id);
                      const isSelected = activeIndex === idx;
                      return (
                        <div
                          key={proj.id}
                          onClick={() => handleSelectItem({ type: 'project', item: proj })}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                                {proj.project_name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
                                {proj.progress_percentage || 0}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Client: {proj.customer_name}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 5. Tasks */}
                {filtered.tasks.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-indigo-500" /> Tasks
                      </span>
                      <span>{filtered.tasks.length}</span>
                    </div>
                    {filtered.tasks.map((task) => {
                      const idx = flatItems.findIndex((x) => x.type === 'task' && (x.item as Task).id === task.id);
                      const isSelected = activeIndex === idx;
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleSelectItem({ type: 'task', item: task })}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                                {task.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-medium">
                                {task.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Assigned to: {task.assigned_to}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => {
                setIsFocused(false);
                onOpenFullModal();
              }}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              <span>View all results in modal</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2">
              <span>Navigate: <strong>↑ ↓</strong></span>
              <span>Select: <strong>↵</strong></span>
              <span>Exit: <strong>Esc</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
