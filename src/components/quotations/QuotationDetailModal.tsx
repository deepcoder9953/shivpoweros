import React, { useState } from 'react';
import {
  Quotation,
  QuotationStatus,
  getStatusLabel,
  getStatusBadgeClass,
  isQuotationExpired,
  formatINR,
} from '../../types/quotation';
import {
  X,
  FileText,
  Printer,
  Edit2,
  Copy,
  Trash2,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Link,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface QuotationDetailModalProps {
  isOpen: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onEdit: (quotation: Quotation) => void;
  onPreview: (quotation: Quotation) => void;
  onDuplicate: (quotationId: string) => void;
  onDelete: (quotation: Quotation) => void;
  onStatusChange: (quotationId: string, newStatus: QuotationStatus) => void;
  onOpenLinkProject?: (quotation: Quotation) => void;
  onCreateProject?: (quotation: Quotation) => void;
  onViewCustomer?: (customerId: string) => void;
  onViewLead?: (leadId: string) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  isOpen,
  quotation,
  onClose,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
  onOpenLinkProject,
  onCreateProject,
  onViewCustomer,
  onViewLead,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !quotation) return null;

  const expired = isQuotationExpired(quotation);
  const statusLabel = getStatusLabel(quotation.status);
  const isAccepted = (quotation.status || '').toLowerCase() === 'accepted';
  const items = quotation.items || [];
  const total = quotation.total || 0;
  const amount = quotation.amount || 0;
  const tax = quotation.tax_amount || 0;
  const taxPercent = quotation.tax_rate || 0;

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as QuotationStatus;
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(quotation.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                  #{quotation.quotation_number}
                </span>
                <span
                  className={`text-2xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                    quotation.status,
                    expired
                  )}`}
                >
                  {expired ? 'Expired' : statusLabel}
                </span>
              </div>
              <h1 className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {quotation.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 shadow-2xs">
              <span className="text-2xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={(quotation.status || 'draft').toLowerCase()}
                onChange={handleStatusSelect}
                disabled={isUpdatingStatus}
                className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="negotiation">Negotiation</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
          {/* Expired Warning Banner */}
          {expired && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold text-xs">
                  This quotation has passed its validity date ({quotation.valid_until || quotation.validity_date}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDuplicate(quotation.id)}
                className="px-2.5 py-1 text-2xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shrink-0"
              >
                Duplicate & Renew
              </button>
            </div>
          )}

          {/* Prompt to link or create project if Accepted */}
          {isAccepted && !quotation.project_id && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">Quotation Accepted!</span>
                  <span className="text-2xs text-emerald-700 dark:text-emerald-400">
                    Ready for delivery? Convert this quotation into an operational project to schedule tasks and track progress.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onCreateProject && (
                  <button
                    id="btn-convert-quotation-to-project"
                    type="button"
                    onClick={() => {
                      onClose();
                      onCreateProject(quotation);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-bold text-2xs rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <span>+ Convert to Project</span>
                  </button>
                )}
                {onOpenLinkProject && (
                  <button
                    type="button"
                    onClick={() => onOpenLinkProject(quotation)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white font-bold text-2xs rounded-lg hover:bg-emerald-800 transition-colors shadow-2xs"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>Link Existing</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Value (incl. GST)
              </span>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {formatINR(total)}
              </div>
              <span className="text-2xs text-slate-500 dark:text-slate-400">
                Net: {formatINR(amount)} + GST ({taxPercent}%): {formatINR(tax)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Issued / Valid Until
              </span>
              <div className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{quotation.quotation_date || quotation.created_at.split('T')[0]}</span>
              </div>
              <span className={`text-2xs ${expired ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                Expires: {quotation.valid_until || quotation.validity_date || '30 days'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Execution Reference
              </span>
              {quotation.project ? (
                <div className="mt-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block truncate">
                    {quotation.project.project_name}
                  </span>
                  <span className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">
                    Status: {quotation.project.status}
                  </span>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="text-xs text-slate-400 italic">Not linked</span>
                  {onCreateProject ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCreateProject(quotation);
                      }}
                      className="text-2xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <span>+ Project</span>
                    </button>
                  ) : onOpenLinkProject ? (
                    <button
                      type="button"
                      onClick={() => onOpenLinkProject(quotation)}
                      className="text-2xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <Link className="w-3 h-3" />
                      <span>Link</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Client & Lead Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Customer Account</span>
                </span>
                {quotation.customer_id && onViewCustomer && (
                  <button
                    type="button"
                    onClick={() => onViewCustomer(quotation.customer_id)}
                    className="text-2xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    <span>View Customer</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {quotation.customer?.company_name || quotation.customer_name || 'Client Account'}
              </div>

              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                {quotation.customer?.contact_person && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{quotation.customer.contact_person}</span>
                  </div>
                )}
                {quotation.customer?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{quotation.customer.phone}</span>
                  </div>
                )}
                {quotation.customer?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{quotation.customer.email}</span>
                  </div>
                )}
                {quotation.customer?.gst_number && (
                  <div className="font-mono text-2xs text-slate-700 dark:text-slate-300 pt-0.5">
                    GSTIN: <span className="font-bold">{quotation.customer.gst_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Lead or Project Scope */}
            <div className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Sales & Pipeline Link</span>
                </span>
                {quotation.lead_id && onViewLead && (
                  <button
                    type="button"
                    onClick={() => onViewLead(quotation.lead_id!)}
                    className="text-2xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    <span>View Lead</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {quotation.lead ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {quotation.lead.company_name}
                  </div>
                  <div className="text-2xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                    <p>Lead Contact: {quotation.lead.contact_person}</p>
                    <p>Lead Stage: <span className="font-semibold text-slate-700 dark:text-slate-300">{quotation.lead.status}</span></p>
                    <p>Source Channel: {quotation.lead.source || 'Direct Enquiry'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400 text-2xs italic py-2">
                  No direct CRM lead attached. This quotation was created directly for the customer account.
                </div>
              )}

              {quotation.description && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-2xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">Scope Notes:</span>
                  {quotation.description}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Itemized Scope Breakdown ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Name & Specs</th>
                    <th className="py-2.5 px-3 text-center w-16">Unit</th>
                    <th className="py-2.5 px-3 text-right w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                    <th className="py-2.5 px-4 text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                        No line items found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.item_name}</div>
                          {item.description && (
                            <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                          {item.unit || 'Nos'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatINR(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatINR(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Tax summary */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST / Tax ({taxPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{formatINR(tax)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-300 dark:border-slate-700 flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-slate-100">
                  <span>Total Payable:</span>
                  <span className="font-mono text-blue-700 dark:text-blue-400 text-base">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(quotation.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(quotation)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-semibold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(quotation)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              id="quotation-detail-preview-btn"
              type="button"
              onClick={() => onPreview(quotation)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Preview & Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
