import React, { useState } from 'react';
import { Customer, CustomerFormData } from '../../types/customer';
import { TeamMember, Lead } from '../../types/lead';
import { Quotation } from '../../types/quotation';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  Building2,
  Phone,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CalendarPlus,
  MessageSquare,
} from 'lucide-react';

interface CustomerManagementProps {
  customers?: Customer[];
  leads?: Lead[];
  teamMembers?: TeamMember[];
  onCreateCustomer: (data: CustomerFormData) => Promise<boolean>;
  onUpdateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<boolean>;
  onDeleteCustomer: (id: string) => Promise<boolean>;
  onScheduleFollowup: (customer: Customer) => void;
  onAddTask: (customer: Customer) => void;
  onViewLead?: (lead: Lead) => void;
  onCreateQuotation?: (customer: Customer) => void;
  onViewQuotation?: (quotation: Quotation) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers = [],
  leads = [],
  teamMembers = [],
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onScheduleFollowup,
  onAddTask,
  onViewLead,
  onCreateQuotation,
  onViewQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeCustomers = customers || [];

  // Filter logic
  const filteredCustomers = safeCustomers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      c.company_name?.toLowerCase().includes(term) ||
      c.contact_person?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.address?.toLowerCase().includes(term) ||
      c.location?.toLowerCase().includes(term) ||
      c.industry?.toLowerCase().includes(term);

    const matchesType = typeFilter === 'all' || c.customer_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      const ok = await onDeleteCustomer(deletingCustomer.id);
      if (ok) {
        setDeletingCustomer(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const findRelatedLead = (customer: Customer | null): Lead | null => {
    if (!customer) return null;
    if (customer.lead_id) {
      return leads.find((l) => l.id === customer.lead_id) || null;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone && cleanPhone.length >= 10) {
      return (
        leads.find((l) => {
          const lPhone = l.phone?.replace(/[^0-9]/g, '');
          return lPhone && (lPhone === cleanPhone || lPhone.slice(-10) === cleanPhone.slice(-10));
        }) || null
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Customer Directory (360°)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage verified client accounts, commercial contracts, and enterprise billing profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCustomer(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-3 transition-colors">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, contact, phone, email, or address..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Types</option>
            <option value="Business">Business</option>
            <option value="Individual">Individual</option>
            <option value="Dealer">Dealer</option>
            <option value="Contractor">Contractor</option>
            <option value="Government">Government</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Potential">Potential</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-auto">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredCustomers.length}</span> of {customers.length}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Company & Contact</th>
                <th className="px-4 py-3">Phone & WhatsApp</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Location / Address</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No customers found</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Adjust your search or filter parameters to locate the account.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Company & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setViewingCustomer(customer)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                            >
                              {customer.company_name || 'Individual Client'}
                            </button>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{customer.contact_person || 'N/A'}</span>
                              {customer.gst_number && (
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">
                                  GST: {customer.gst_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <a href={`tel:${customer.phone}`} className="text-slate-800 dark:text-slate-200 hover:text-blue-600 font-medium">
                            {customer.phone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {customer.email ? (
                          <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                            {customer.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                        {customer.address || customer.location || <span className="text-slate-400">—</span>}
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
                        {customer.industry || 'General'}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {customer.customer_type || 'Business'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            customer.status === 'Active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onScheduleFollowup(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingCustomer(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Customer 360"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCustomer(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const cleanPhone = customer.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={customer.id}
                id={`customer-mobile-card-${customer.id}`}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => setViewingCustomer(customer)}
                      className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {customer.company_name || 'Individual Client'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Contact: {customer.contact_person || 'N/A'}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      customer.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between font-mono">
                    <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                      {customer.phone}
                    </a>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                  {customer.email && <div className="truncate">{customer.email}</div>}
                  {customer.address && <div className="truncate text-slate-500 dark:text-slate-400">{customer.address}</div>}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {customer.customer_type}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onScheduleFollowup(customer)}
                      className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingCustomer(customer)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsFormOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCustomer(customer)}
                      className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={async (data) => {
          if (editingCustomer) {
            const ok = await onUpdateCustomer(editingCustomer.id, data);
            if (ok) {
              setIsFormOpen(false);
              setEditingCustomer(null);
            }
            return ok;
          } else {
            const ok = await onCreateCustomer(data);
            if (ok) {
              setIsFormOpen(false);
            }
            return ok;
          }
        }}
        initialData={editingCustomer}
        teamMembers={teamMembers}
      />

      {/* Customer 360 Detail Modal */}
      <CustomerDetailModal
        isOpen={Boolean(viewingCustomer)}
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={(customer) => {
          setViewingCustomer(null);
          setEditingCustomer(customer);
          setIsFormOpen(true);
        }}
        onScheduleFollowup={(customer) => {
          onScheduleFollowup(customer);
        }}
        onAddTask={(customer) => {
          onAddTask(customer);
        }}
        onCreateQuotation={onCreateQuotation}
        onViewQuotation={onViewQuotation}
        relatedLead={findRelatedLead(viewingCustomer)}
        onViewLead={onViewLead}
      />

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Confirm Customer Account Removal</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{deletingCustomer.company_name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
