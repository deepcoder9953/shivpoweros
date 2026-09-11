import React, { useState, useEffect } from 'react';
import { Lead, LeadFormData, LeadStatus, LeadSource, TeamMember } from '../../types/lead';
import { X, Building2, User, Phone, Mail, MapPin, Zap, Tag, ShieldCheck, AlertCircle } from 'lucide-react';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from './LeadFilterBar';

export const POWER_INDUSTRIES = [
  'Manufacturing & Industrial',
  'Healthcare & Hospitals',
  'Commercial & Real Estate',
  'Hospitality & Hotels',
  'Educational Institutes',
  'Data Centers & IT Parks',
  'Retail & Shopping Malls',
  'Agriculture & Cold Storage',
  'Residential Society',
  'Construction & Infrastructure',
  'Government & Defense',
  'Other',
];

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<boolean>;
  initialData?: Lead | null;
  teamMembers: TeamMember[];
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teamMembers,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<LeadFormData>({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    location: '',
    industry: 'Manufacturing & Industrial',
    lead_source: 'Website',
    requirement: '',
    status: 'New',
    lead_score: 50,
    notes: '',
    assigned_to: 'Vikram Mehta (Sales Lead)',
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
        location: initialData.location || '',
        industry: initialData.industry || 'Manufacturing & Industrial',
        lead_source: initialData.lead_source || 'Website',
        requirement: initialData.requirement || '',
        status: initialData.status || 'New',
        lead_score: initialData.lead_score ?? 50,
        notes: initialData.notes || '',
        assigned_to: initialData.assigned_to || (teamMembers[0]?.name || 'Unassigned'),
      });
    } else {
      setFormData({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        location: '',
        industry: 'Manufacturing & Industrial',
        lead_source: 'Website',
        requirement: '',
        status: 'New',
        lead_score: 50,
        notes: '',
        assigned_to: teamMembers[0]?.name || 'Vikram Mehta (Sales Lead)',
      });
    }
    setErrors({});
  }, [initialData, isOpen, teamMembers]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Requirement: Company Name OR Contact Person must be present
    const hasCompany = Boolean(formData.company_name.trim());
    const hasContact = Boolean(formData.contact_person.trim());

    if (!hasCompany && !hasContact) {
      newErrors.company_name = 'Either Company Name or Contact Person is required';
      newErrors.contact_person = 'Either Contact Person or Company Name is required';
    }

    // Phone is required
    const cleanedPhone = formData.phone.trim();
    if (!cleanedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanedPhone.replace(/[^0-9]/g, '').length < 7) {
      newErrors.phone = 'Please enter a valid phone number (at least 7 digits)';
    }

    // Status is required
    if (!formData.status) {
      newErrors.status = 'Lead status is required';
    }

    // Email format validation (when email is provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please provide a valid email address (e.g. name@company.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreChange = (score: number) => {
    setFormData((prev) => ({ ...prev, lead_score: score }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="lead-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Lead Information' : 'Add New Power Solution Lead'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? `Update details for ${initialData?.company_name || initialData?.contact_person}`
                : 'Capture customer inquiries for DG sets, Solar systems, or AMC contracts'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Please resolve the following:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Row 1: Company & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company_name" className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization Name
                <span className="text-slate-400 font-normal ml-1">(Required if no contact person)</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="company_name"
                  type="text"
                  placeholder="e.g. Apex Hospital, Shanti Steel Mills"
                  value={formData.company_name}
                  onChange={(e) => {
                    setFormData({ ...formData, company_name: e.target.value });
                    if (errors.company_name) setErrors((prev) => ({ ...prev, company_name: '', contact_person: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.company_name
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact_person" className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
                <span className="text-slate-400 font-normal ml-1">(Required if no company)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="contact_person"
                  type="text"
                  placeholder="e.g. Rajesh Sharma, Purchase Manager"
                  value={formData.contact_person}
                  onChange={(e) => {
                    setFormData({ ...formData, contact_person: e.target.value });
                    if (errors.contact_person) setErrors((prev) => ({ ...prev, company_name: '', contact_person: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.contact_person
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="lead-phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="lead-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="lead-email"
                  type="email"
                  placeholder="e.g. purchase@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 3: Location & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-location" className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Site Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="lead-location"
                  type="text"
                  placeholder="e.g. Noida Sector 62, Gurugram, Jaipur"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lead-industry" className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Sector
              </label>
              <select
                id="lead-industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {POWER_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Lead Source, Status, Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="lead-source" className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  id="lead-source"
                  value={formData.lead_source}
                  onChange={(e) => setFormData({ ...formData, lead_source: e.target.value as LeadSource })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="lead-status" className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline Status <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  id="lead-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assigned_to" className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Sales Rep
              </label>
              <select
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Power Solution Requirement */}
          <div>
            <label htmlFor="requirement" className="block text-xs font-semibold text-slate-700 mb-1">
              Power Requirement / Equipment Specification
            </label>
            <div className="relative">
              <Zap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                id="requirement"
                rows={2}
                placeholder="e.g. 125 kVA Silent DG Set with CPCB IV+ compliance, AMF auto-start panel, acoustic enclosure, or 50 kW rooftop solar."
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </div>

          {/* Row 6: Lead Score Slider */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="lead_score" className="text-xs font-semibold text-slate-700">
                Lead Priority Score: <span className="font-bold text-blue-700">{formData.lead_score} / 100</span>
              </label>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  formData.lead_score >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : formData.lead_score >= 50
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {formData.lead_score >= 80 ? '🔥 Hot Lead' : formData.lead_score >= 50 ? '⚡ Warm Lead' : '❄️ Cold Lead'}
              </span>
            </div>
            <input
              id="lead_score"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.lead_score}
              onChange={(e) => handleScoreChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 (Cold inquiry)</span>
              <span>50 (Moderate interest)</span>
              <span>100 (Immediate PO ready)</span>
            </div>
          </div>

          {/* Row 7: Internal Notes */}
          <div>
            <label htmlFor="lead-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Team Notes & Context
            </label>
            <textarea
              id="lead-notes"
              rows={2}
              placeholder="Record any discussion notes, budget constraints, delivery urgency, or competing brand quotes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-lead-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? 'Saving Lead...' : isEditing ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
