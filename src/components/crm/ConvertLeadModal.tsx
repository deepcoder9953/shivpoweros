import React, { useState, useEffect } from 'react';
import { Lead } from '../../types/lead';
import { Customer, CustomerType } from '../../types/customer';
import { customersService } from '../../lib/customersService';
import { leadsService } from '../../lib/leadsService';
import { activitiesService } from '../../lib/activitiesService';
import {
  X,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ConvertLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConversionSuccess: (createdCustomer: Customer) => void;
  onOpenExistingCustomer?: (customer: Customer) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onConversionSuccess,
  onOpenExistingCustomer,
}) => {
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
  const [duplicateReason, setDuplicateReason] = useState<string>('');

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Business');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (lead && isOpen) {
      setCompanyName(lead.company_name || '');
      setContactPerson(lead.contact_person || '');
      setPhone(lead.phone || '');
      setEmail(lead.email || '');
      setAddress(lead.location || '');
      setIndustry(lead.industry || 'Manufacturing & Industrial');
      setCustomerType('Business');
      setGstNumber('');
      setNotes(lead.notes ? `Lead Notes: ${lead.notes}` : '');
      setErrorMsg(null);
      setDuplicateCustomer(null);
      setDuplicateReason('');

      // Perform duplicate check
      checkDuplicate(lead);
    }
  }, [lead, isOpen]);

  const checkDuplicate = async (leadData: Lead) => {
    setIsCheckingDuplicate(true);
    try {
      const match = await customersService.findMatchingCustomer({
        lead_id: leadData.id,
        phone: leadData.phone,
        email: leadData.email,
        company_name: leadData.company_name,
      });

      if (match.matched && match.customer) {
        setDuplicateCustomer(match.customer);
        setDuplicateReason(match.reason || 'Existing customer record found');
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Phone number is required to create a customer.');
      return;
    }
    if (!companyName.trim() && !contactPerson.trim()) {
      setErrorMsg('Either company name or contact person is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create or Convert customer record
      const convertRes = await customersService.convertLeadToCustomer(lead.id, {
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        location: address.trim(),
        industry: industry.trim(),
        customer_type: customerType,
        gst_number: gstNumber.trim(),
        assigned_to: lead.assigned_to,
        notes: notes.trim(),
      });

      if (convertRes.error && !convertRes.customer) {
        if (convertRes.existingCustomer) {
          setDuplicateCustomer(convertRes.existingCustomer);
          setDuplicateReason(convertRes.error);
        } else {
          setErrorMsg(convertRes.error);
        }
        setIsSubmitting(false);
        return;
      }

      const newCustomer = convertRes.customer!;

      // 2. Update lead status to 'Won'
      await leadsService.updateStatus(lead.id, 'Won');

      // 3. Log lead activity
      await leadsService.logActivity(
        lead.id,
        'Lead Converted to Customer',
        `Converted to customer "${newCustomer.company_name || newCustomer.contact_person}" (ID: ${newCustomer.id})`
      );

      // 4. Log customer activity
      await activitiesService.createActivity({
        lead_id: lead.id,
        customer_id: newCustomer.id,
        action: 'Customer Created from Lead',
        description: `Customer account established from Won Lead: ${lead.company_name || lead.contact_person}`,
        performed_by: lead.assigned_to || 'System',
      });

      onConversionSuccess(newCustomer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to convert lead to customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="convert-lead-modal"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Convert Lead to Customer</h3>
              <p className="text-xs text-slate-500">
                Confirm customer account creation and mark inquiry as Won.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Duplicate Banner Warning if detected */}
          {duplicateCustomer && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-amber-900">Customer already exists!</h4>
                  <p className="text-amber-700 mt-0.5">
                    {duplicateReason}. To avoid creating duplicate records, you can link to or open this existing customer.
                  </p>
                  <div className="mt-2.5 p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {duplicateCustomer.company_name || duplicateCustomer.contact_person}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Phone: {duplicateCustomer.phone} {duplicateCustomer.email ? `· ${duplicateCustomer.email}` : ''}
                      </span>
                    </div>
                    {onOpenExistingCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenExistingCustomer(duplicateCustomer);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Open Customer</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form id="convert-lead-form" onSubmit={handleConvert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Business">Business / Commercial</option>
                  <option value="Individual">Individual Consumer</option>
                  <option value="Dealer">Dealer / Channel Partner</option>
                  <option value="Contractor">Contractor / EPC</option>
                  <option value="Government">Government / Public Sector</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 08AAAAA0000A1Z5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Billing Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full delivery/billing address"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Conversion Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details regarding this account"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="convert-lead-form"
            disabled={isSubmitting || Boolean(duplicateCustomer)}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
              duplicateCustomer
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <span>Converting...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Convert to Customer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
