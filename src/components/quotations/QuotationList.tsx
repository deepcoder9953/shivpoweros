import React, { useState, useMemo } from 'react';
import {
  Quotation,
  QuotationStatus,
  getStatusLabel,
  getStatusBadgeClass,
  isQuotationExpired,
  formatINR,
} from '../../types/quotation';
import { Customer } from '../../types/customer';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Printer,
  Building2,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  customers: Customer[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onView: (quotation: Quotation) => void;
  onPreview: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDuplicate: (quotationId: string) => void;
  onDelete: (quotation: Quotation) => void;
  onStatusChange: (quotationId: string, newStatus: QuotationStatus) => void;
  onOpenCreateModal: () => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  customers,
  activeStatusFilter,
  onSelectStatusFilter,
  onView,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
  onOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  // Filter & sort logic
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((q) => {
        // Status filter
        if (activeStatusFilter !== 'all') {
          if (activeStatusFilter === 'expired') {
            if (!isQuotationExpired(q)) return false;
          } else {
            const s = (q.status || 'draft').toLowerCase();
            if (s !== activeStatusFilter.toLowerCase()) return false;
          }
        }

        // Customer filter
        if (customerFilter !== 'all' && q.customer_id !== customerFilter) {
          return false;
        }

        // Search term matching quotation_number, title, customer_name, customer contact, description
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchNumber = q.quotation_number.toLowerCase().includes(term);
          const matchTitle = (q.title || '').toLowerCase().includes(term);
          const matchCustomer = (q.customer?.company_name || q.customer_name || '').toLowerCase().includes(term);
          const matchContact = (q.customer?.contact_person || '').toLowerCase().includes(term);
          const matchDesc = (q.description || '').toLowerCase().includes(term);

          if (!matchNumber && !matchTitle && !matchCustomer && !matchContact && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOrder === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortOrder === 'amount_high') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortOrder === 'amount_low') {
          return (a.total || 0) - (b.total || 0);
        }
        return 0;
      });
  }, [quotations, activeStatusFilter, customerFilter, searchTerm, sortOrder]);

  const hasActiveFilters = Boolean(searchTerm) || customerFilter !== 'all' || activeStatusFilter !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setCustomerFilter('all');
    onSelectStatusFilter('all');
    setSortOrder('newest');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              id="quotations-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by quote #, equipment title, customer company, contact person..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Customer Filter */}
            <div className="flex items-center gap-1.5 min-w-[160px]">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                id="quotations-customer-filter"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                id="quotations-sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High → Low</option>
                <option value="amount_low">Amount: Low → High</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 text-2xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              >
                Reset
              </button>
            )}

            <button
              id="quotation-list-new-btn"
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Quotation</span>
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredQuotations.length}</strong> of{' '}
            {quotations.length} quotations
          </span>
          {activeStatusFilter !== 'all' && (
            <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md">
              Filtered by: {getStatusLabel(activeStatusFilter)}
            </span>
          )}
        </div>
      </div>

      {/* Main Table / Cards View */}
      {filteredQuotations.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No quotations found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No quotations match the active search or filter criteria. Try clearing filters.'
              : 'Create your first commercial quotation for generators, solar plants, or service contracts.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Quotation</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-2xs">
                    <th className="py-3 px-4 w-36">Quote #</th>
                    <th className="py-3 px-4">Customer / Contact</th>
                    <th className="py-3 px-4">Equipment & Scope</th>
                    <th className="py-3 px-4 text-right w-32">Total (₹)</th>
                    <th className="py-3 px-4 text-center w-28">Status</th>
                    <th className="py-3 px-4 w-28">Validity</th>
                    <th className="py-3 px-4 text-right w-44">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotations.map((quotation) => {
                    const expired = isQuotationExpired(quotation);
                    const statusLabel = getStatusLabel(quotation.status);
                    const itemsCount = quotation.items?.length || 0;

                    return (
                      <tr
                        key={quotation.id}
                        id={`quotation-row-${quotation.id}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Quotation Number */}
                        <td className="py-3.5 px-4 font-mono">
                          <button
                            type="button"
                            onClick={() => onView(quotation)}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs block text-left"
                          >
                            #{quotation.quotation_number}
                          </button>
                          <span className="text-2xs text-slate-400 dark:text-slate-500 block mt-0.5">
                            {quotation.quotation_date || quotation.created_at.split('T')[0]}
                          </span>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {quotation.customer?.company_name || quotation.customer_name || 'Client'}
                          </div>
                          <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                            {quotation.customer?.contact_person && (
                              <span>{quotation.customer.contact_person}</span>
                            )}
                            {quotation.customer?.phone && <span>• {quotation.customer.phone}</span>}
                          </div>
                        </td>

                        {/* Title & Scope */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={quotation.title}>
                            {quotation.title}
                          </div>
                          <div className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
                            {quotation.project_id && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">• Linked Project</span>
                            )}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {formatINR(quotation.total)}
                          </div>
                          {quotation.tax_rate > 0 && (
                            <div className="text-2xs text-slate-400 dark:text-slate-500">
                              incl. {quotation.tax_rate}% GST
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-2xs font-bold ${getStatusBadgeClass(quotation.status)}`}>
                            {statusLabel}
                          </span>
                          {expired && quotation.status !== 'accepted' && quotation.status !== 'rejected' && (
                            <span className="block text-3xs text-rose-500 font-semibold mt-0.5">Expired</span>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-2xs">
                          {quotation.valid_until ? (
                            <span className={expired ? 'text-rose-500 font-bold' : ''}>
                              {quotation.valid_until}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Status Quick Select */}
                            <select
                              value={quotation.status}
                              onChange={(e) =>
                                onStatusChange(quotation.id, e.target.value as QuotationStatus)
                              }
                              className="text-2xs py-1 px-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                              title="Quick change status"
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="viewed">Viewed</option>
                              <option value="negotiation">Negotiate</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                              <option value="expired">Expired</option>
                            </select>

                            {/* Preview & Print */}
                            <button
                              type="button"
                              onClick={() => onPreview(quotation)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                              title="Preview & Print Official Quotation"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* View Detail */}
                            <button
                              type="button"
                              onClick={() => onView(quotation)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Quotation Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => onEdit(quotation)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                              title="Edit Quotation"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => onDuplicate(quotation.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                              title="Duplicate Quotation"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => onDelete(quotation)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {filteredQuotations.map((quotation) => {
              const expired = isQuotationExpired(quotation);
              const statusLabel = getStatusLabel(quotation.status);

              return (
                <div
                  key={quotation.id}
                  id={`quotation-card-${quotation.id}`}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        #{quotation.quotation_number}
                      </span>
                      <h4
                        onClick={() => onView(quotation)}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mt-0.5"
                      >
                        {quotation.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {quotation.customer?.company_name || quotation.customer_name || 'Direct Client'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(quotation.status)}`}>
                        {statusLabel}
                      </span>
                      {expired && (
                        <span className="block text-[10px] text-rose-500 font-bold mt-0.5">Expired</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500">Commercial Total</span>
                    <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                      {formatINR(quotation.total)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onView(quotation)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onPreview(quotation)}
                        className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Print / PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(quotation)}
                        className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(quotation.id)}
                        className="p-2 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(quotation)}
                        className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
