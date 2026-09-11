import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData, CustomerType, CustomerStatus } from '../../types/customer';
import { TeamMember } from '../../types/lead';
import { X, Building2, User, Phone, Mail, MapPin, Tag, ShieldCheck } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<boolean>;
  initialData?: Customer | null;
  teamMembers: TeamMember[];
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teamMembers,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<CustomerFormData>({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    location: '',
    industry: 'Manufacturing & Industrial',
    customer_type: 'Business',
    gst_number: '',
    assigned_to: 'Vikram Mehta (Sales Lead)',
    status: 'Active',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        contact_person: initialData.contact_person || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || initialData.location || '',
        location: initialData.location || initialData.address || '',
        industry: initialData.industry || 'Manufacturing & Industrial',
        customer_type: initialData.customer_type || 'Business',
        gst_number: initialData.gst_number || '',
        assigned_to: initialData.assigned_to || (teamMembers[0]?.name || 'Unassigned'),
        status: initialData.status || 'Active',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        location: '',
        industry: 'Manufacturing & Industrial',
        customer_type: 'Business',
        gst_number: '',
        assigned_to: teamMembers[0]?.name || 'Vikram Mehta (Sales Lead)',
        status: 'Active',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, teamMembers]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.phone?.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.company_name?.trim() && !formData.contact_person?.trim()) {
      errs.company_name = 'Either company name or contact person is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        ...formData,
        location: formData.address,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="customer-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Customer Account' : 'Add New Customer'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update existing client organization or billing details'
                  : 'Register a new customer account in the system'}
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

        {/* Form Body */}
        <form id="customer-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Row 1: Company & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Apex Industrial Solutions"
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 ${
                  errors.company_name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.company_name && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-hidden focus:ring-2 ${
                  errors.phone ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@apexind.com"
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 ${
                  errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 3: Industry & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Manufacturing, Textile, Healthcare"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Type
              </label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Business">Business / Corporate</option>
                <option value="Individual">Individual Consumer</option>
                <option value="Dealer">Dealer / Distributor</option>
                <option value="Contractor">Contractor / EPC</option>
                <option value="Government">Government / Public Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 4: GST Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                placeholder="e.g. 08AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Potential">Potential</option>
                <option value="Inactive">Inactive</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 5: Assigned Salesperson */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Manager / Assigned Person
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.role})
                </option>
              ))}
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          {/* Row 6: Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / Plant Location
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot No. 45, RIICO Industrial Area, Mansarovar, Jaipur"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Account Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special equipment preferences, delivery terms, payment histories..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

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
            form="customer-form"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create Customer Account'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
