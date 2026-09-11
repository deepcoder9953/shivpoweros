import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from '../../types/customer';
import { Lead } from '../../types/lead';
import { Task } from '../../types/task';
import { FollowupRecord } from '../../types/followup';
import { ActivityRecord } from '../../types/activity';
import {
  Quotation,
  getStatusBadgeClass,
  getStatusLabel,
  formatINR,
} from '../../types/quotation';
import { tasksService } from '../../lib/tasksService';
import { followupsService } from '../../lib/followupsService';
import { activitiesService } from '../../lib/activitiesService';
import { quotationsService } from '../../lib/quotationsService';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckSquare,
  History,
  Edit2,
  FileText,
  CalendarPlus,
  MessageSquare,
  Sparkles,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onScheduleFollowup: (customer: Customer) => void;
  onAddTask: (customer: Customer) => void;
  onCreateQuotation?: (customer: Customer) => void;
  onViewQuotation?: (quotation: Quotation) => void;
  relatedLead?: Lead | null;
  onViewLead?: (lead: Lead) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  customer,
  onClose,
  onEdit,
  onScheduleFollowup,
  onAddTask,
  onCreateQuotation,
  onViewQuotation,
  relatedLead,
  onViewLead,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quotations' | 'leads' | 'followups' | 'tasks' | 'activities'>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [followups, setFollowups] = useState<FollowupRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      loadCustomerRelations(customer.id);
    }
  }, [customer, isOpen]);

  const loadCustomerRelations = async (customerId: string) => {
    setIsLoadingRelated(true);
    try {
      const [tRes, fRes, aRes, qRes] = await Promise.all([
        tasksService.getTasksByCustomer(customerId),
        followupsService.getFollowupsByCustomer(customerId),
        activitiesService.getActivitiesByCustomer(customerId),
        quotationsService.getQuotationsByCustomer(customerId),
      ]);
      setTasks(tRes.tasks || []);
      setFollowups(fRes.followups || []);
      setActivities(aRes.activities || []);
      setQuotations(qRes.quotations || []);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  // Compute Next Best Action recommendation
  const nextBestAction = useMemo(() => {
    if (!customer) return null;

    // 1. Check for pending quotations that need follow-up
    const activeQuote = quotations.find((q) => q.status === 'Sent' || q.status === 'Negotiation');
    if (activeQuote) {
      return {
        title: `Follow-up on Quotation #${activeQuote.quotation_number}`,
        detail: `Commercial proposal for ${formatINR(activeQuote.total)} is currently under review by ${customer.contact_person || customer.company_name}. Send a prompt technical clarification or discount threshold via WhatsApp.`,
        actionType: 'quotation',
        actionLabel: 'Review Quote',
        onAction: () => onViewQuotation && onViewQuotation(activeQuote),
      };
    }

    // 2. Check for overdue follow-up
    const overdueFollowup = followups.find((f) => f.status === 'Pending' && new Date(f.followup_date) < new Date());
    if (overdueFollowup) {
      return {
        title: `Overdue Follow-up: ${overdueFollowup.subject}`,
        detail: `Scheduled for ${new Date(overdueFollowup.followup_date).toLocaleDateString('en-IN')}. Call ${customer.contact_person} at ${customer.phone} to close this pending item.`,
        actionType: 'followup',
        actionLabel: 'Reschedule / Call',
        onAction: () => onScheduleFollowup(customer),
      };
    }

    // 3. If no quotations exist yet
    if (quotations.length === 0) {
      return {
        title: 'Draft Generator / AMC Commercial Proposal',
        detail: `No formal quotation has been generated for ${customer.company_name}. Assess load requirements and draft an initial DG set or maintenance contract quote.`,
        actionType: 'create_quote',
        actionLabel: '+ Draft Quotation',
        onAction: () => onCreateQuotation && onCreateQuotation(customer),
      };
    }

    // 4. If all quotes accepted or none pending
    return {
      title: 'Quarterly Maintenance & Relationship Touchpoint',
      detail: `Account status is ${customer.status}. Schedule a quarterly preventative maintenance check-in or battery replacement survey.`,
      actionType: 'followup',
      actionLabel: 'Schedule Touchpoint',
      onAction: () => onScheduleFollowup(customer),
    };
  }, [customer, quotations, followups, onViewQuotation, onScheduleFollowup, onCreateQuotation]);

  if (!isOpen || !customer) return null;

  const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="customer-detail-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto transition-colors"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  customer.status === 'Active'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {customer.status}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                {customer.customer_type || 'Business'}
              </span>
              {customer.gst_number && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  GST: {customer.gst_number}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {customer.company_name || customer.contact_person}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contact: <span className="text-slate-700 dark:text-slate-200 font-medium">{customer.contact_person || 'N/A'}</span>
              {customer.industry && <span> · Industry: {customer.industry}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(customer)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          <div className="flex space-x-6 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Customer 360</span>
            </button>

            <button
              type="button"
              id="customer-tab-quotations"
              onClick={() => setActiveTab('quotations')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quotations</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                {quotations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'leads'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Inquiry / Lead</span>
              {relatedLead && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">1</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('followups')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'followups'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Follow-ups</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {followups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {tasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'activities'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {activities.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* AI Next Best Action Recommendation Banner */}
              {nextBestAction && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-2xs flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-700 dark:text-blue-300">
                        AI Next Best Action
                      </span>
                      {nextBestAction.actionLabel && (
                        <button
                          type="button"
                          onClick={nextBestAction.onAction}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:underline"
                        >
                          <span>{nextBestAction.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {nextBestAction.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {nextBestAction.detail}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Phone & WhatsApp
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${customer.phone}`} className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600">
                        {customer.phone}
                      </a>
                    </div>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {customer.email ? (
                      <a href={`mailto:${customer.email}`} className="text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 font-medium truncate">
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No email registered</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Organization & Commercial Profile
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Account Manager</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{customer.assigned_to || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Industry Sector</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{customer.industry || 'General Power'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">GST Number</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{customer.gst_number || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Account Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{customer.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 block">Operational Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {customer.address || customer.location || 'No physical address provided'}
                    </span>
                  </div>
                </div>

                {customer.notes && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">Account Notes & Specifications</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-wrap">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                {onCreateQuotation && (
                  <button
                    type="button"
                    onClick={() => onCreateQuotation(customer)}
                    className="px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ New Quotation</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onScheduleFollowup(customer)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Schedule Follow-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddTask(customer)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Quotations Tab */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Commercial Quotations ({quotations.length})
                </h3>
                {onCreateQuotation && (
                  <button
                    type="button"
                    onClick={() => onCreateQuotation(customer)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create Quote</span>
                  </button>
                )}
              </div>

              {isLoadingRelated ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading quotations...</div>
              ) : quotations.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No quotations found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Generate a formal proposal for diesel generators, AMCs, or servicing.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {quotations.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            #{quote.quotation_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(quote.status)}`}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{quote.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>Total: <strong className="text-slate-900 dark:text-slate-100 font-bold">{formatINR(quote.total)}</strong></span>
                          <span>· Date: {new Date(quote.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>

                      {onViewQuotation && (
                        <button
                          type="button"
                          onClick={() => onViewQuotation(quote)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Related Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Origination Inquiry & Lead Source
              </h3>
              {relatedLead ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {relatedLead.company_name || relatedLead.contact_person}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {relatedLead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Source: <strong className="text-slate-800 dark:text-slate-200">{relatedLead.lead_source}</strong></p>
                    {relatedLead.requirement && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                        &quot;{relatedLead.requirement}&quot;
                      </p>
                    )}
                  </div>
                  {onViewLead && (
                    <button
                      type="button"
                      onClick={() => onViewLead(relatedLead)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-xl shrink-0"
                    >
                      View Lead
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  Direct client account (no originating inbound lead registered).
                </div>
              )}
            </div>
          )}

          {/* 4. Follow-ups Tab */}
          {activeTab === 'followups' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Follow-up Reminders ({followups.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onScheduleFollowup(customer)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-xl flex items-center gap-1"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>+ Follow-up</span>
                </button>
              </div>

              {followups.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No scheduled follow-ups for this customer.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {followups.map((fup) => (
                    <div key={fup.id} className="p-3.5 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{fup.subject}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {fup.followup_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Date: {new Date(fup.followup_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fup.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {fup.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Associated Tasks ({tasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onAddTask(customer)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-xl flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>+ Task</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No active tasks for this account.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3.5 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{task.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {task.priority}
                          </span>
                        </div>
                        {task.due_date && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Due: {new Date(task.due_date).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Customer Interaction History
              </h3>
              {activities.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No activity history logged for this customer account.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activities.map((act) => (
                    <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{act.action}: </span>
                          <span className="text-slate-600 dark:text-slate-400">{act.description}</span>
                          {act.performed_by && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">by {act.performed_by}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(act.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Created: {new Date(customer.created_at).toLocaleDateString('en-IN')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
