import React, { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { Lead } from '../../types/lead';
import { Customer } from '../../types/customer';
import { Quotation, formatINR } from '../../types/quotation';
import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { CRMTab } from '../crm/CRMNavigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Lead[];
  customers?: Customer[];
  quotations?: Quotation[];
  projects?: Project[];
  tasks?: Task[];
  onNavigateTab: (tab: CRMTab) => void;
  onSelectLead?: (lead: Lead) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectQuotation?: (quotation: Quotation) => void;
  onSelectProject?: (project: Project) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  leads = [],
  customers = [],
  quotations = [],
  projects = [],
  tasks = [],
  onNavigateTab,
  onSelectLead,
  onSelectCustomer,
  onSelectQuotation,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { leads: [], customers: [], quotations: [], projects: [], tasks: [] };

    return {
      leads: leads
        .filter(
          (l) =>
            l.company_name?.toLowerCase().includes(q) ||
            l.contact_person?.toLowerCase().includes(q) ||
            l.phone?.toLowerCase().includes(q) ||
            l.email?.toLowerCase().includes(q) ||
            l.requirement?.toLowerCase().includes(q)
        )
        .slice(0, 4),
      customers: customers
        .filter(
          (c) =>
            c.company_name?.toLowerCase().includes(q) ||
            c.contact_person?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.location?.toLowerCase().includes(q)
        )
        .slice(0, 4),
      quotations: quotations
        .filter(
          (qt) =>
            qt.quotation_number?.toLowerCase().includes(q) ||
            qt.title?.toLowerCase().includes(q) ||
            qt.customer_name?.toLowerCase().includes(q) ||
            qt.customer?.company_name?.toLowerCase().includes(q)
        )
        .slice(0, 4),
      projects: projects
        .filter(
          (p) =>
            p.project_name?.toLowerCase().includes(q) ||
            p.customer_name?.toLowerCase().includes(q) ||
            p.assigned_to?.toLowerCase().includes(q)
        )
        .slice(0, 4),
      tasks: tasks
        .filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.assigned_to?.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [query, leads, customers, quotations, projects, tasks]);

  const totalResults =
    results.leads.length +
    results.customers.length +
    results.quotations.length +
    results.projects.length +
    results.tasks.length;

  if (!isOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="global-search-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, customers, quotes, projects, tasks..."
            className="w-full bg-transparent border-0 text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Search Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">Type to search across all operating modules</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Search by company name, contact, quote number (QTN-...), or keywords.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Check spelling or try a shorter search term.</p>
            </div>
          ) : (
            <>
              {/* Leads */}
              {results.leads.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      Leads ({results.leads.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('leads');
                        onClose();
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View in Leads <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.leads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          if (onSelectLead) onSelectLead(lead);
                          else onNavigateTab('leads');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {lead.company_name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold">
                              {lead.status}
                            </span>
                            {lead.lead_score >= 80 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 font-bold flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                {lead.lead_score}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {lead.contact_person} · {lead.phone} · {lead.requirement}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      Customers ({results.customers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('customers');
                        onClose();
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View in Customers <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (onSelectCustomer) onSelectCustomer(c);
                          else onNavigateTab('customers');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {c.company_name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                              {c.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {c.contact_person} · {c.phone} · {c.location || c.address}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotations */}
              {results.quotations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      Quotations ({results.quotations.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('quotations');
                        onClose();
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View in Quotes <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.quotations.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          if (onSelectQuotation) onSelectQuotation(q);
                          else onNavigateTab('quotations');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                              {q.quotation_number}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {q.title || q.customer_name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {q.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Customer: {q.customer?.company_name || q.customer_name} · Total:{' '}
                            <strong className="text-slate-900 dark:text-slate-100">{formatINR(q.total)}</strong>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-emerald-500" />
                      Projects ({results.projects.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('projects');
                        onClose();
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View in Projects <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (onSelectProject) onSelectProject(p);
                          else onNavigateTab('projects');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {p.project_name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {p.status}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {p.progress_percentage || 0}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            Client: {p.customer_name} · Lead: {p.assigned_to || 'Unassigned'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Tasks ({results.tasks.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab('tasks');
                        onClose();
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View in Tasks <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigateTab('tasks');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            Status: {t.status} · Priority: {t.priority} · Assigned: {t.assigned_to}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
