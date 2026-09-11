import React, { useState, useEffect } from 'react';
import {
  Quotation,
  QuotationFormData,
  QuotationItemFormData,
  QuotationStatus,
  formatINR,
} from '../../types/quotation';
import { Customer } from '../../types/customer';
import { Lead } from '../../types/lead';
import { Project } from '../../types/project';
import { quotationsService } from '../../lib/quotationsService';
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Calendar,
  Building2,
  FileText,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuotationFormData) => Promise<{ success: boolean; error?: string }>;
  initialData?: Quotation | null;
  customers: Customer[];
  leads?: Lead[];
  projects?: Project[];
  preselectedCustomerId?: string;
  preselectedLeadId?: string;
}

const COMMON_POWER_ITEMS = [
  {
    name: '250 kVA Silent CPCB IV+ DG Set',
    desc: 'Cummins QSL9-G5 engine, Stamford alternator, AMF panel & acoustic enclosure',
    price: 1650000,
    unit: 'Set',
  },
  {
    name: '125 kVA Silent DG Set (CPCB IV+)',
    desc: 'Heavy-duty radiator cooled diesel generator with AMF control panel',
    price: 980000,
    unit: 'Set',
  },
  {
    name: '550 Wp Mono PERC Half-Cut Solar Modules',
    desc: 'Tier-1 high efficiency solar PV modules with 25-year warranty',
    price: 16500,
    unit: 'Nos',
  },
  {
    name: '100 kW 3-Phase Solar Grid-Tie Inverter',
    desc: 'Multi-MPPT solar string inverter with integrated cloud telemetry',
    price: 340000,
    unit: 'Nos',
  },
  {
    name: 'Turnkey Installation, Testing & Commissioning',
    desc: 'Civil work, cabling, exhaust ducting, testing, and liaison approvals',
    price: 180000,
    unit: 'Job',
  },
  {
    name: 'Annual Maintenance Contract (Comprehensive)',
    desc: 'Scheduled visits, lube & filter replacements, 24x7 emergency callout',
    price: 95000,
    unit: 'Year',
  },
];

export const QuotationFormModal: React.FC<QuotationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  customers,
  leads = [],
  projects = [],
  preselectedCustomerId,
  preselectedLeadId,
}) => {
  const [quotationNumber, setQuotationNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [leadId, setLeadId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('draft');
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST

  const [items, setItems] = useState<QuotationItemFormData[]>([
    {
      item_name: '',
      description: '',
      quantity: 1,
      unit: 'Nos',
      unit_price: 0,
      total: 0,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setQuotationNumber(initialData.quotation_number);
      setCustomerId(initialData.customer_id);
      setLeadId(initialData.lead_id || '');
      setProjectId(initialData.project_id || '');
      setTitle(initialData.title);
      setDescription(initialData.description || initialData.notes || '');
      setValidUntil(
        initialData.valid_until ||
          initialData.validity_date ||
          new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      );
      setStatus((initialData.status || 'draft').toLowerCase() as QuotationStatus);

      // Derive tax rate
      const amt = initialData.amount || initialData.subtotal || 0;
      const tx = initialData.tax || 0;
      if (amt > 0 && tx > 0) {
        setTaxRate(Math.round((tx / amt) * 100));
      } else {
        setTaxRate(18);
      }

      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it) => ({
            id: it.id,
            item_name: it.item_name,
            description: it.description || '',
            quantity: it.quantity || 1,
            unit: it.unit || 'Nos',
            unit_price: it.unit_price || 0,
            total: it.total || (it.quantity || 1) * (it.unit_price || 0),
          }))
        );
      } else {
        setItems([
          {
            item_name: '',
            description: '',
            quantity: 1,
            unit: 'Nos',
            unit_price: 0,
            total: 0,
          },
        ]);
      }
    } else {
      // New quotation defaults
      setCustomerId(preselectedCustomerId || (customers.length > 0 ? customers[0].id : ''));
      setLeadId(preselectedLeadId || '');
      setProjectId('');
      setTitle('');
      setDescription('');
      // Default validity 30 days from now
      setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setStatus('draft');
      setTaxRate(18);
      setItems([
        {
          item_name: '',
          description: '',
          quantity: 1,
          unit: 'Nos',
          unit_price: 0,
          total: 0,
        },
      ]);

      // Auto-generate quotation number
      quotationsService.generateNextQuotationNumber().then((num) => {
        setQuotationNumber(num);
      });
    }

    setFormError(null);
  }, [isOpen, initialData, preselectedCustomerId, preselectedLeadId, customers]);

  if (!isOpen) return null;

  // Live calculation of totals
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.unit_price || 0);
    return sum + qty * price;
  }, 0);

  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  // Handle line item update
  const handleItemChange = (
    index: number,
    field: keyof QuotationItemFormData,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      if (field === 'quantity' || field === 'unit_price') {
        const q = Number(field === 'quantity' ? value : target.quantity || 1);
        const p = Number(field === 'unit_price' ? value : target.unit_price || 0);
        target.total = q * p;
      }

      next[index] = target;
      return next;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        item_name: '',
        description: '',
        quantity: 1,
        unit: 'Nos',
        unit_price: 0,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([
        {
          item_name: '',
          description: '',
          quantity: 1,
          unit: 'Nos',
          unit_price: 0,
          total: 0,
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPresetItem = (index: number, preset: (typeof COMMON_POWER_ITEMS)[0]) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        item_name: preset.name,
        description: preset.desc,
        unit_price: preset.price,
        unit: preset.unit,
        total: (next[index].quantity || 1) * preset.price,
      };
      return next;
    });
  };

  const handleAutoGenerateNumber = async () => {
    const nextNum = await quotationsService.generateNextQuotationNumber();
    setQuotationNumber(nextNum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!quotationNumber.trim()) {
      setFormError('Quotation number is required.');
      return;
    }
    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }
    if (!title.trim()) {
      setFormError('Quotation title or equipment scope is required.');
      return;
    }

    // Validate at least one valid item
    const validItems = items.filter((it) => it.item_name.trim().length > 0);
    if (validItems.length === 0) {
      setFormError('Please add at least one line item with an item name.');
      return;
    }

    setIsSubmitting(true);

    const formData: QuotationFormData = {
      quotation_number: quotationNumber.trim().toUpperCase(),
      customer_id: customerId,
      lead_id: leadId || null,
      project_id: projectId || null,
      title: title.trim(),
      description: description.trim() || null,
      amount: subtotal,
      subtotal,
      tax: taxAmount,
      tax_rate: taxRate,
      total: grandTotal,
      status,
      valid_until: validUntil || null,
      items: validItems.map((it) => ({
        ...it,
        quantity: Math.max(1, Number(it.quantity || 1)),
        unit_price: Math.max(0, Number(it.unit_price || 0)),
        total: Math.max(1, Number(it.quantity || 1)) * Math.max(0, Number(it.unit_price || 0)),
      })),
    };

    const res = await onSubmit(formData);
    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Failed to save quotation.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? `Edit Quotation — ${initialData.quotation_number}` : 'Create Commercial Quotation'}
              </h2>
              <p className="text-xs text-slate-500">
                Generate itemized commercial estimates with automatic GST calculations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Top Section: Quotation Info & Relations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quotation Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Quotation Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateNumber}
                  className="text-2xs text-blue-600 hover:text-blue-800 font-bold"
                  title="Generate next sequential number"
                >
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                id="form-quotation-number"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. SPS-2026-0043"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            {/* Customer Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Account <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-quotation-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.contact_person})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Lead Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Linked Lead <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                id="form-quotation-lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">-- None (Direct Customer) --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company_name} — {l.contact_person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row: Title, Expiry Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quotation Title / Equipment Scope <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="form-quotation-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply & Commissioning of 250 kVA Silent DG Set"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valid Until <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="form-quotation-valid-until"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quotation Status
              </label>
              <select
                id="form-quotation-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
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
          </div>

          {/* Description / Scope details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Technical Scope Notes
            </label>
            <textarea
              id="form-quotation-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. EPC Turnkey execution with standard 2 years warranty, AMF synchronization panel, and delivery within 2 weeks..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* LINE ITEMS REPEATER BUILDER */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>Itemized Bill of Materials & Services</span>
                </h3>
                <p className="text-2xs text-slate-500">
                  Add line items, quantities, and rates. Totals and GST calculate automatically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Preset dropdown */}
                <select
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    if (!isNaN(idx)) {
                      applyPresetItem(items.length - 1, COMMON_POWER_ITEMS[idx]);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-2xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700"
                >
                  <option value="" disabled>
                    + Insert Standard Item Preset
                  </option>
                  {COMMON_POWER_ITEMS.map((preset, pIdx) => (
                    <option key={pIdx} value={pIdx}>
                      {preset.name} ({formatINR(preset.price)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  id="add-line-item-row-btn"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-2xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                    {/* Item Name */}
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Item name (e.g. 250 kVA Silent DG Set)"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2">
                      <select
                        value={item.unit || 'Nos'}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Set">Set</option>
                        <option value="Job">Job</option>
                        <option value="Meter">Meter</option>
                        <option value="Year">Year</option>
                        <option value="Kit">Kit</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)
                        }
                        className="w-full px-2 py-1.5 text-xs font-bold text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs font-mono">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-5 pr-2 py-1.5 text-xs font-mono font-bold text-right border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Line Total & Remove */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {formatINR((item.quantity || 1) * (item.unit_price || 0))}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={items.length === 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                        title="Delete Item Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Description Sub-row */}
                  <div>
                    <input
                      type="text"
                      placeholder="Optional specifications, engine model, rating, or scope notes..."
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2.5 py-1 text-2xs text-slate-600 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Panel */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">GST / Tax Rate:</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                >
                  <option value={18}>18% GST (Standard)</option>
                  <option value={12}>12% GST (Solar EPC)</option>
                  <option value={5}>5% GST</option>
                  <option value={0}>0% (Tax Exempt)</option>
                </select>
              </div>

              <div className="w-full sm:w-80 bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount ({taxRate}%):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatINR(taxAmount)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Quotation Total:</span>
                  <span className="font-mono text-blue-700">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-quotation-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <span>{initialData ? 'Update Quotation' : 'Create Quotation'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
